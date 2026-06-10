import { getDb } from '$lib/server/db';
import { pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { tableSessions, orderBatches, orderItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
	const tableId = url.searchParams.get('table');
	const sessionId = cookies.get('session_id');

	if (!platform?.env.DB) error(500, 'Service unavailable');
	const db = getDb(platform.env.DB);

	let activeSession = null;
	let table = null;

	if (tableId) {
		[table, activeSession] = await Promise.all([
			db.query.tables.findFirst({ where: (t, { eq }) => eq(t.id, tableId) }),
			db.query.tableSessions.findFirst({
				where: and(eq(tableSessions.tableId, tableId), eq(tableSessions.status, 'open'))
			})
		]);
	} else if (sessionId) {
		activeSession = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.id, sessionId), eq(tableSessions.status, 'open'))
		});
	}

	return {
		tableId,
		table,
		activeSession
	};
};

export const actions: Actions = {
	order: async ({ request, platform, cookies }) => {
		if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });

		const data = await request.formData();
		const tableId = data.get('tableId') as string;
		const customerName = data.get('customerName') as string;
		const itemsJson = data.get('items') as string;

		if (!itemsJson) return fail(400, { message: 'Invalid order data' });

		let items: Array<{ menuId: string; quantity: number; price: number; name: string }>;
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return fail(400, { message: 'Invalid items data' });
		}

		if (!items.length) return fail(400, { message: 'Keranjang belanja kosong' });

		const db = getDb(platform.env.DB);
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

		// Jika tidak ada sesi aktif, baru kita wajibkan identitas
		if (!session) {
			if (!tableId && !customerName) {
				return fail(400, { message: 'Nama atau Nomor Meja diperlukan' });
			}

			const [newSession] = await db
				.insert(tableSessions)
				.values({
					tableId: tableId || null,
					customerName: customerName || null,
					totalPrice: 0
				})
				.returning();
			session = newSession;

			if (!tableId) {
				cookies.set('session_id', session.id, { path: '/', maxAge: 60 * 60 * 12 });
			}
		}

		// Buat batch baru
		const [batch] = await db
			.insert(orderBatches)
			.values({ sessionId: session.id, totalPrice: batchTotal })
			.returning();

		// Buat items
		await db.insert(orderItems).values(
			items.map((i) => ({
				batchId: batch.id,
				menuId: i.menuId,
				quantity: i.quantity,
				priceAtTime: i.price
			}))
		);

		// Update total sesi
		await db
			.update(tableSessions)
			.set({ totalPrice: session.totalPrice + batchTotal, paymentStatus: 'unpaid' })
			.where(eq(tableSessions.id, session.id));

		// Notifikasi realtime ke admin & halaman status
		await pusherTrigger(
			platform.env,
			sessionChannels(session.id, tableId || session.tableId),
			'new-batch',
			{ sessionId: session.id }
		);

		if (tableId) {
			redirect(303, `/table/${tableId}`);
		} else {
			redirect(303, `/order/status/${session.id}`);
		}
	}
};
