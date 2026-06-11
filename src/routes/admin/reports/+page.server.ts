import { getDb } from '$lib/server/db';
import { tableSessions, orderBatches, orderItems, menus } from '$lib/server/db/schema';
import { eq, and, sql, ne } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	const empty = {
		days: 30,
		dailyRevenue: [] as { day: string; sessionCount: number; revenue: number }[],
		topItems: [] as {
			menuId: string;
			name: string;
			image: string | null;
			totalQty: number;
			totalRevenue: number;
		}[],
		summary: { revenue: 0, sessions: 0, avgPerSession: 0 }
	};

	if (!platform?.env.DB) return empty;

	const days = Math.min(Math.max(parseInt(url.searchParams.get('days') ?? '30'), 1), 90);
	const sinceEpoch = Math.floor(Date.now() / 1000) - days * 86400;

	const db = getDb(platform.env.DB);

	const [dailyRevenue, topItems] = await Promise.all([
		db
			.select({
				day: sql<string>`date(${tableSessions.closedAt}, 'unixepoch', 'localtime')`,
				sessionCount: sql<number>`cast(count(*) as integer)`,
				revenue: sql<number>`coalesce(sum(${tableSessions.totalPrice}), 0)`
			})
			.from(tableSessions)
			.where(
				and(
					eq(tableSessions.paymentStatus, 'paid'),
					eq(tableSessions.status, 'closed'),
					sql`${tableSessions.closedAt} >= ${sinceEpoch}`
				)
			)
			.groupBy(sql`date(${tableSessions.closedAt}, 'unixepoch', 'localtime')`)
			.orderBy(sql`date(${tableSessions.closedAt}, 'unixepoch', 'localtime') DESC`),

		db
			.select({
				menuId: orderItems.menuId,
				name: menus.name,
				image: menus.image,
				totalQty: sql<number>`cast(sum(${orderItems.quantity}) as integer)`,
				totalRevenue: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.priceAtTime}), 0)`
			})
			.from(orderItems)
			.innerJoin(orderBatches, eq(orderItems.batchId, orderBatches.id))
			.innerJoin(tableSessions, eq(orderBatches.sessionId, tableSessions.id))
			.innerJoin(menus, eq(orderItems.menuId, menus.id))
			.where(
				and(
					eq(tableSessions.paymentStatus, 'paid'),
					eq(tableSessions.status, 'closed'),
					sql`${tableSessions.closedAt} >= ${sinceEpoch}`,
					ne(orderBatches.status, 'cancelled')
				)
			)
			.groupBy(orderItems.menuId)
			.orderBy(sql`sum(${orderItems.quantity}) DESC`)
			.limit(10)
	]);

	const totalRevenue = dailyRevenue.reduce((s, r) => s + r.revenue, 0);
	const totalSessions = dailyRevenue.reduce((s, r) => s + r.sessionCount, 0);

	return {
		days,
		dailyRevenue,
		topItems,
		summary: {
			revenue: totalRevenue,
			sessions: totalSessions,
			avgPerSession: totalSessions > 0 ? totalRevenue / totalSessions : 0
		}
	};
};
