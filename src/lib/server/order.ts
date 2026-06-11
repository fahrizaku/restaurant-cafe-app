import { getDb } from '$lib/server/db';
import { pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { menus, tableSessions, orderBatches, orderItems } from '$lib/server/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Cookies, ActionFailure } from '@sveltejs/kit';

export interface RawOrderItem {
	menuId: string;
	quantity: number;
	notes?: string;
}

/**
 * Proses satu order (batch) untuk menu publik, cart, dan POS kasir.
 * `cookies` null = mode POS: tanpa lookup/set cookie session_id,
 * order takeaway selalu membuat sesi baru.
 */
export async function processOrder(
	platform: App.Platform | undefined,
	cookies: Cookies | null,
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
	const menuRecords = await db.select().from(menus).where(inArray(menus.id, uniqueMenuIds));

	const availableMenus = menuRecords.filter((m) => m.isAvailable);
	if (availableMenus.length !== uniqueMenuIds.length) {
		const unavailableNames = menuRecords.filter((m) => !m.isAvailable).map((m) => m.name);
		return fail(400, {
			message: unavailableNames.length
				? `Menu tidak tersedia: ${unavailableNames.join(', ')}. Hapus dari keranjang lalu pesan lagi.`
				: 'Beberapa menu sudah tidak ada. Muat ulang halaman menu.'
		});
	}

	const menuMap = new Map(availableMenus.map((m) => [m.id, m]));
	const items = rawItems.map((i) => ({
		menuId: i.menuId,
		quantity: i.quantity,
		price: menuMap.get(i.menuId)!.price,
		notes: typeof i.notes === 'string' ? i.notes.trim().slice(0, 200) || null : null
	}));
	const batchTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

	// Kebijakan bayar-dulu: satu order = satu tagihan. Sesi `open` berarti
	// tagihan belum dibayar (markPaid memindahkan sesi ke `processing`),
	// jadi order baru ditolak sampai tagihan itu diselesaikan.
	let existing = null;
	if (tableId) {
		existing = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.tableId, tableId), eq(tableSessions.status, 'open'))
		});
	} else if (cookies) {
		const sessionId = cookies.get('session_id');
		if (sessionId) {
			existing = await db.query.tableSessions.findFirst({
				where: and(eq(tableSessions.id, sessionId), eq(tableSessions.status, 'open'))
			});
		}
	}
	if (existing) {
		return fail(400, {
			message:
				'Masih ada pesanan yang belum dibayar. Selesaikan pembayaran terlebih dahulu, lalu pesan lagi.'
		});
	}

	// Buat sesi baru — satu order selalu sesi (tagihan) baru
	if (!tableId && !customerName) {
		return fail(400, { message: 'Nama atau Nomor Meja diperlukan' });
	}

	let session;
	try {
		const [newSession] = await db
			.insert(tableSessions)
			.values({ tableId: tableId || null, customerName: customerName || null, totalPrice: 0 })
			.returning();
		session = newSession;
	} catch {
		// Unique constraint: request lain sudah buat sesi untuk meja ini duluan.
		// Bayar-dulu: jangan tumpangi tagihan order lain — tolak.
		return fail(400, {
			message:
				'Masih ada pesanan yang belum dibayar. Selesaikan pembayaran terlebih dahulu, lalu pesan lagi.'
		});
	}

	if (!tableId && cookies) {
		cookies.set('session_id', session.id, { path: '/', maxAge: 60 * 60 * 12 });
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
				priceAtTime: i.price,
				notes: i.notes
			}))
		),
		db
			.update(tableSessions)
			.set({
				totalPrice: sql`${tableSessions.totalPrice} + ${batchTotal}`,
				// Total berubah — klaim transfer sebelumnya tidak berlaku lagi
				paymentStatus: 'unpaid',
				paymentProof: null
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
