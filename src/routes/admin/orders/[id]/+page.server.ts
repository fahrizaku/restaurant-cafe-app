import { getDb } from '$lib/server/db';
import { pusherClientConfig, pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { tableSessions, orderBatches } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const session = await db.query.tableSessions.findFirst({
		where: eq(tableSessions.id, params.id),
		with: {
			table: true,
			batches: {
				orderBy: (b, { desc }) => [desc(b.createdAt)],
				with: { items: { with: { menu: true } } }
			}
		}
	});

	if (!session) error(404, 'Session not found');
	return { session, pusher: pusherClientConfig(platform.env) };
};

export const actions: Actions = {
	markPaid: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const paymentMethod = data.get(
			'paymentMethod'
		) as typeof tableSessions.$inferSelect.paymentMethod;
		if (!paymentMethod) return fail(400, { message: 'Payment method required' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ paymentStatus: 'paid', paymentMethod, status: 'processing' })
			.where(eq(tableSessions.id, params.id))
			.returning({ tableId: tableSessions.tableId });
		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	completeSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'closed', closedAt: new Date() })
			.where(eq(tableSessions.id, params.id))
			.returning({ tableId: tableSessions.tableId });
		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	cancelSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'cancelled', closedAt: new Date() })
			.where(eq(tableSessions.id, params.id))
			.returning({ tableId: tableSessions.tableId });

		// Batalkan semua batch yang belum selesai dalam sesi ini
		await db
			.update(orderBatches)
			.set({ status: 'cancelled' })
			.where(
				and(
					eq(orderBatches.sessionId, params.id),
					inArray(orderBatches.status, ['pending', 'processing'])
				)
			);

		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	reopenSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		// Hanya reset status sesi; pertahankan catatan pembayaran sebelumnya
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'open', closedAt: null })
			.where(eq(tableSessions.id, params.id))
			.returning({ tableId: tableSessions.tableId });
		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	}
};
