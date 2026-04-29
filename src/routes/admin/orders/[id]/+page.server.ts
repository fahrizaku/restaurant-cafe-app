import { getDb } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const order = await db.query.orders.findFirst({
		where: eq(orders.id, params.id),
		with: {
			table: true,
			items: { with: { menu: true } }
		}
	});

	if (!order) error(404, 'Order not found');
	return { order };
};

export const actions: Actions = {
	updateStatus: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const status = data.get('status') as typeof orders.$inferSelect.status;
		if (!status) return fail(400, { message: 'Status required' });

		const db = getDb(platform.env.DB);
		await db.update(orders).set({ status }).where(eq(orders.id, params.id));
		return { success: true };
	}
};
