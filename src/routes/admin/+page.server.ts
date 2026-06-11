import { getDb } from '$lib/server/db';
import { menus, categories, tables, tableSessions } from '$lib/server/db/schema';
import { inArray, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return { stats: { menus: 0, categories: 0, openSessions: 0, tables: 0 }, recentSessions: [] };
	}

	const db = getDb(platform.env.DB);
	const count = sql<number>`count(*)`;

	const [[menuCount], [categoryCount], [tableCount], [openCount], recentSessions] =
		await Promise.all([
			db.select({ c: count }).from(menus),
			db.select({ c: count }).from(categories),
			db.select({ c: count }).from(tables),
			db
				.select({ c: count })
				.from(tableSessions)
				.where(inArray(tableSessions.status, ['open', 'processing'])),
			db.query.tableSessions.findMany({
				orderBy: (s, { desc }) => [desc(s.openedAt)],
				limit: 5,
				with: { table: true, batches: { with: { items: true } } }
			})
		]);

	return {
		stats: {
			menus: menuCount.c,
			categories: categoryCount.c,
			openSessions: openCount.c,
			tables: tableCount.c
		},
		recentSessions
	};
};
