import { getDb } from '$lib/server/db';
import { pusherClientConfig, pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { tableSessions, orderBatches } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { getBankInfo } from '$lib/server/settings';
import { requestTransfer } from '$lib/server/payment';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const [session, bank] = await Promise.all([
		db.query.tableSessions.findFirst({
			where: eq(tableSessions.id, params.id),
			with: {
				table: true,
				batches: {
					orderBy: (b, { desc }) => [desc(b.createdAt)],
					with: {
						items: {
							with: { menu: true }
						}
					}
				}
			}
		}),
		getBankInfo(db)
	]);

	if (!session) error(404, 'Pesanan tidak ditemukan');

	return { session, bank, pusher: pusherClientConfig(platform.env) };
};

export const actions: Actions = {
	requestTransfer: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });

		const data = await request.formData();
		return requestTransfer(platform, params.id, data.get('proof'));
	},

	// Customer membatalkan tagihannya sendiri — hanya selama belum ada
	// pembayaran (unpaid). Setelah klaim transfer/lunas, harus lewat kasir.
	cancelOrder: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });

		const db = getDb(platform.env.DB);
		const session = await db.query.tableSessions.findFirst({
			where: eq(tableSessions.id, params.id)
		});
		if (!session) return fail(404, { message: 'Pesanan tidak ditemukan' });
		if (session.status !== 'open' || session.paymentStatus !== 'unpaid') {
			return fail(400, {
				message: 'Pesanan ini tidak bisa dibatalkan sendiri. Silakan hubungi kasir.'
			});
		}

		await db.batch([
			db
				.update(tableSessions)
				.set({ status: 'cancelled', closedAt: new Date() })
				.where(eq(tableSessions.id, params.id)),
			db
				.update(orderBatches)
				.set({ status: 'cancelled' })
				.where(
					and(
						eq(orderBatches.sessionId, params.id),
						inArray(orderBatches.status, ['pending', 'processing'])
					)
				)
		]);

		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, session.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true, cancelled: true };
	}
};
