import { getDb } from '$lib/server/db';
import { orders, orderItems } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const tableId = url.searchParams.get('table');
	
	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const [table, categories] = await Promise.all([
		tableId ? db.query.tables.findFirst({ where: (t, { eq }) => eq(t.id, tableId) }) : Promise.resolve(null),
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

	const categoriesWithMenus = categories.filter((c) => c.menus.length > 0);

	return { table: table ?? null, categories: categoriesWithMenus };
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

		const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
		const orderId = crypto.randomUUID();

		await db.insert(orders).values({
			id: orderId,
			tableId,
			status: 'pending',
			totalPrice
		});

		await db.insert(orderItems).values(
			items.map((i) => ({
				id: crypto.randomUUID(),
				orderId,
				menuId: i.menuId,
				quantity: i.quantity,
				priceAtTime: i.price
			}))
		);

		redirect(303, `/order/${orderId}`);
	}
};
