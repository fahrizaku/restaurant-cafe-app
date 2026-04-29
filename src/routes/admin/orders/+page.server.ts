import { getDb } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (!platform?.env.DB) return { orders: [] };

	const db = getDb(platform.env.DB);
	const status = url.searchParams.get('status') as typeof orders.$inferSelect.status | null;

	const allOrders = await db.query.orders.findMany({
		where: status ? eq(orders.status, status) : undefined,
		orderBy: (o, { desc }) => [desc(o.createdAt)],
		with: {
			table: true,
			items: { with: { menu: true } }
		}
	});

	return { orders: allOrders, currentStatus: status };
};

export const actions: Actions = {
	updateStatus: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;
		const status = data.get('status') as typeof orders.$inferSelect.status;

		if (!id || !status) return fail(400, { message: 'ID and status required' });

		const db = getDb(platform.env.DB);
		await db.update(orders).set({ status }).where(eq(orders.id, id));
		return { success: true };
	},

	markPaid: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;
		const paymentMethod = data.get('paymentMethod') as typeof orders.$inferSelect.paymentMethod;

		if (!id || !paymentMethod) return fail(400, { message: 'ID and payment method required' });

		const db = getDb(platform.env.DB);
		await db.update(orders).set({ paymentStatus: 'paid', paymentMethod }).where(eq(orders.id, id));
		return { success: true };
	}
};
