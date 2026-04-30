import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return { stats: { menus: 0, categories: 0, openSessions: 0, tables: 0 }, recentSessions: [] };
	}

	const db = getDb(platform.env.DB);

	const [menus, categories, sessions, tables] = await Promise.all([
		db.query.menus.findMany(),
		db.query.categories.findMany(),
		db.query.tableSessions.findMany({
			orderBy: (s, { desc }) => [desc(s.openedAt)],
			limit: 5,
			with: { table: true, batches: { with: { items: true } } }
		}),
		db.query.tables.findMany()
	]);

	const openSessions = sessions.filter((s) => s.status === 'open' || s.status === 'processing').length;

	return {
		stats: { menus: menus.length, categories: categories.length, openSessions, tables: tables.length },
		recentSessions: sessions
	};
};
