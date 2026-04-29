import { getDb } from '$lib/server/db';
import { tableSessions, orderBatches, orderItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const tableId = url.searchParams.get('table');

	if (!tableId) {
		return { noTable: true, table: null, categories: [], activeSession: null };
	}

	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const [table, categories, activeSession] = await Promise.all([
		db.query.tables.findFirst({ where: (t, { eq }) => eq(t.id, tableId) }),
		db.query.categories.findMany({
			orderBy: (c, { asc }) => [asc(c.order), asc(c.name)],
			with: {
				menus: {
					where: (m, { eq }) => eq(m.isAvailable, true),
					orderBy: (m, { asc }) => [asc(m.name)]
				}
			}
		}),
		db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.tableId, tableId), eq(tableSessions.status, 'open'))
		})
	]);

	if (!table) error(404, 'Table not found');

	const categoriesWithMenus = categories.filter((c) => c.menus.length > 0);

	return { noTable: false, table, categories: categoriesWithMenus, activeSession: activeSession ?? null };
};

export const actions: Actions = {
	order: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });

		const data = await request.formData();
		const tableId = data.get('tableId') as string;
		const itemsJson = data.get('items') as string;

		if (!tableId || !itemsJson) return fail(400, { message: 'Invalid order data' });

		let items: Array<{ menuId: string; quantity: number; price: number; name: string }>;
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return fail(400, { message: 'Invalid items data' });
		}

		if (!items.length) return fail(400, { message: 'Cart is empty' });

		const db = getDb(platform.env.DB);
		const batchTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

		// Cari sesi aktif atau buat baru
		let session = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.tableId, tableId), eq(tableSessions.status, 'open'))
		});

		if (!session) {
			const [newSession] = await db
				.insert(tableSessions)
				.values({ tableId, totalPrice: 0 })
				.returning();
			session = newSession;
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
			.set({ totalPrice: session.totalPrice + batchTotal })
			.where(eq(tableSessions.id, session.id));

		redirect(303, `/table/${tableId}`);
	}
};
