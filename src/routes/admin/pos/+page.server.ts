import { getDb } from '$lib/server/db';
import { tableSessions, orderBatches, orderItems } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { tables: [], categories: [] };

	const db = getDb(platform.env.DB);

	const [tables, categories] = await Promise.all([
		db.query.tables.findMany({
			orderBy: (t, { asc }) => [asc(t.name)],
			with: {
				sessions: {
					where: (s, { eq }) => eq(s.status, 'open'),
					limit: 1
				}
			}
		}),
		db.query.categories.findMany({
			orderBy: (c, { asc }) => [asc(c.order), asc(c.name)],
			with: {
				menus: {
					where: (m, { eq }) => eq(m.isAvailable, true),
					orderBy: (m, { asc }) => [asc(m.name)]
				}
			}
		})
	]);

	return {
		tables,
		categories: categories.filter((c) => c.menus.length > 0)
	};
};

export const actions: Actions = {
	order: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const tableId = data.get('tableId') as string;
		const itemsJson = data.get('items') as string;

		if (!tableId || !itemsJson) return fail(400, { message: 'Data tidak lengkap' });

		let items: Array<{ menuId: string; quantity: number; price: number; notes?: string }>;
		try {
			items = JSON.parse(itemsJson);
		} catch {
			return fail(400, { message: 'Format data tidak valid' });
		}

		if (!items.length) return fail(400, { message: 'Pesanan kosong' });

		const db = getDb(platform.env.DB);
		const batchTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

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

		const [batch] = await db
			.insert(orderBatches)
			.values({ sessionId: session.id, totalPrice: batchTotal })
			.returning();

		await db.insert(orderItems).values(
			items.map((i) => ({
				batchId: batch.id,
				menuId: i.menuId,
				quantity: i.quantity,
				priceAtTime: i.price,
				notes: i.notes || null
			}))
		);

		// Reset paymentStatus jika sebelumnya sudah paid
		await db
			.update(tableSessions)
			.set({ totalPrice: session.totalPrice + batchTotal, paymentStatus: 'unpaid' })
			.where(eq(tableSessions.id, session.id));

		redirect(303, `/admin/orders/${session.id}`);
	}
};
