import { getDb } from '$lib/server/db';
import { pusherClientConfig, pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { tableSessions, orderBatches } from '$lib/server/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ platform, url }) => {
	if (!platform?.env.DB) {
		return { sessions: [], currentStatus: null, page: 1, pageSize: PAGE_SIZE, total: 0, pusher: null };
	}

	const db = getDb(platform.env.DB);
	const status = url.searchParams.get('status') as typeof tableSessions.$inferSelect.status | null;
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1);

	const where = status ? eq(tableSessions.status, status) : undefined;
	const [sessions, [{ total }]] = await Promise.all([
		db.query.tableSessions.findMany({
			where,
			orderBy: (s, { desc }) => [desc(s.openedAt)],
			limit: PAGE_SIZE,
			offset: (page - 1) * PAGE_SIZE,
			with: {
				table: true,
				batches: { with: { items: true } }
			}
		}),
		db.select({ total: sql<number>`count(*)` }).from(tableSessions).where(where)
	]);

	return {
		sessions,
		currentStatus: status,
		page,
		pageSize: PAGE_SIZE,
		total,
		pusher: pusherClientConfig(platform.env)
	};
};

export const actions: Actions = {
	markPaid: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;
		const paymentMethod = data.get(
			'paymentMethod'
		) as typeof tableSessions.$inferSelect.paymentMethod;

		if (!id || !paymentMethod) return fail(400, { message: 'ID and payment method required' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ paymentStatus: 'paid', paymentMethod, status: 'processing' })
			.where(eq(tableSessions.id, id))
			.returning({ tableId: tableSessions.tableId });
		await pusherTrigger(platform.env, sessionChannels(id, updated?.tableId), 'session-updated', {
			sessionId: id
		});
		return { success: true };
	},

	completeSession: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID required' });

		const db = getDb(platform.env.DB);
		// Hanya sesi yang sudah dibayar yang boleh diselesaikan
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'closed', closedAt: new Date() })
			.where(and(eq(tableSessions.id, id), eq(tableSessions.paymentStatus, 'paid')))
			.returning({ tableId: tableSessions.tableId });
		if (!updated) {
			return fail(400, { message: 'Sesi belum dibayar — tandai lunas terlebih dahulu.' });
		}
		await pusherTrigger(platform.env, sessionChannels(id, updated?.tableId), 'session-updated', {
			sessionId: id
		});
		return { success: true };
	},

	cancelSession: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID required' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'cancelled', closedAt: new Date() })
			.where(eq(tableSessions.id, id))
			.returning({ tableId: tableSessions.tableId });

		// Batalkan semua batch yang belum selesai dalam sesi ini
		await db
			.update(orderBatches)
			.set({ status: 'cancelled' })
			.where(and(eq(orderBatches.sessionId, id), inArray(orderBatches.status, ['pending', 'processing'])));

		await pusherTrigger(platform.env, sessionChannels(id, updated?.tableId), 'session-updated', {
			sessionId: id
		});
		return { success: true };
	}
};
