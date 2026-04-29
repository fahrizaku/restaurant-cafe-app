import { getDb } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');

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
