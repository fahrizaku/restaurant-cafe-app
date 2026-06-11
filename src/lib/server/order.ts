import { getDb } from '$lib/server/db';
import { pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { menus, tableSessions, orderBatches, orderItems } from '$lib/server/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Cookies, ActionFailure } from '@sveltejs/kit';

export interface RawOrderItem {
	menuId: string;
	quantity: number;
}

export async function processOrder(
	platform: App.Platform | undefined,
	cookies: Cookies,
	tableId: string | null,
	customerName: string | null,
	rawItems: RawOrderItem[]
): Promise<ActionFailure<{ message: string }> | { sessionId: string; tableId: string | null }> {
	if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });
	if (!rawItems.length) return fail(400, { message: 'Keranjang belanja kosong' });

	// Validasi quantity sebelum menyentuh DB
	for (const item of rawItems) {
		const qty = Number(item.quantity);
		if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
			return fail(400, { message: 'Jumlah item tidak valid (harus antara 1–99)' });
		}
	}

	const db = getDb(platform.env.DB);

	// Validasi keberadaan meja jika tableId diberikan
	if (tableId) {
		const table = await db.query.tables.findFirst({
			where: (t, { eq }) => eq(t.id, tableId)
		});
		if (!table) return fail(400, { message: 'Meja tidak ditemukan' });
	}

	// Ambil harga dari DB — jangan pernah percaya harga dari client
	const uniqueMenuIds = [...new Set(rawItems.map((i) => i.menuId))];
	const menuRecords = await db
		.select()
		.from(menus)
		.where(and(inArray(menus.id, uniqueMenuIds), eq(menus.isAvailable, true)));

	if (menuRecords.length !== uniqueMenuIds.length) {
		return fail(400, { message: 'Beberapa menu tidak tersedia atau sudah tidak ada' });
	}

	const menuMap = new Map(menuRecords.map((m) => [m.id, m]));
	const items = rawItems.map((i) => ({
		menuId: i.menuId,
		quantity: i.quantity,
		price: menuMap.get(i.menuId)!.price
	}));
	const batchTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

	// Cari sesi aktif
	let session = null;
	if (tableId) {
		session = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.tableId, tableId), eq(tableSessions.status, 'open'))
		});
	} else {
		const sessionId = cookies.get('session_id');
		if (sessionId) {
			session = await db.query.tableSessions.findFirst({
				where: and(eq(tableSessions.id, sessionId), eq(tableSessions.status, 'open'))
			});
		}
	}

	// Buat sesi baru jika belum ada
	if (!session) {
		if (!tableId && !customerName) {
			return fail(400, { message: 'Nama atau Nomor Meja diperlukan' });
		}

		const [newSession] = await db
			.insert(tableSessions)
			.values({ tableId: tableId || null, customerName: customerName || null, totalPrice: 0 })
			.returning();
		session = newSession;

		if (!tableId) {
			cookies.set('session_id', session.id, { path: '/', maxAge: 60 * 60 * 12 });
		}
	}

	// Insert batch + items + update total dalam satu batch D1 (atomic)
	const batchId = crypto.randomUUID();
	await db.batch([
		db.insert(orderBatches).values({ id: batchId, sessionId: session.id, totalPrice: batchTotal }),
		db.insert(orderItems).values(
			items.map((i) => ({
				batchId,
				menuId: i.menuId,
				quantity: i.quantity,
				priceAtTime: i.price
			}))
		),
		db
			.update(tableSessions)
			.set({
				totalPrice: sql`${tableSessions.totalPrice} + ${batchTotal}`,
				paymentStatus: 'unpaid'
			})
			.where(eq(tableSessions.id, session.id))
	]);

	await pusherTrigger(
		platform.env,
		sessionChannels(session.id, tableId || session.tableId),
		'new-batch',
		{ sessionId: session.id }
	);

	return { sessionId: session.id, tableId };
}
