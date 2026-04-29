import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return { stats: { menus: 0, categories: 0, orders: 0, tables: 0 }, recentOrders: [] };
	}

	const db = getDb(platform.env.DB);

	const [menus, categories, orders, tables] = await Promise.all([
		db.query.menus.findMany(),
		db.query.categories.findMany(),
		db.query.orders.findMany({ orderBy: (o, { desc }) => [desc(o.createdAt)], limit: 5, with: { table: true, items: true } }),
		db.query.tables.findMany()
	]);

	return {
		stats: {
			menus: menus.length,
			categories: categories.length,
			orders: orders.length,
			tables: tables.length
		},
		recentOrders: orders
	};
};
