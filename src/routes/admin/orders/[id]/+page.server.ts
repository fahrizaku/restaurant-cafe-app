import { getDb } from '$lib/server/db';
import { tableSessions, orderBatches } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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
	return { session };
};

export const actions: Actions = {
	updateBatchStatus: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const batchId = data.get('batchId') as string;
		const status = data.get('status') as typeof orderBatches.$inferSelect.status;

		if (!batchId || !status) return fail(400, { message: 'batchId and status required' });

		const db = getDb(platform.env.DB);

		// Jika cancel, kurangi total sesi
		if (status === 'cancelled') {
			const batch = await db.query.orderBatches.findFirst({
				where: eq(orderBatches.id, batchId),
				with: { session: true }
			});
			if (batch && batch.session) {
				await db.update(tableSessions)
					.set({ totalPrice: Math.max(0, batch.session.totalPrice - batch.totalPrice) })
					.where(eq(tableSessions.id, batch.session.id));
			}
		}

		await db.update(orderBatches).set({ status }).where(eq(orderBatches.id, batchId));
		return { success: true };
	},

	markPaid: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const paymentMethod = data.get('paymentMethod') as typeof tableSessions.$inferSelect.paymentMethod;
		if (!paymentMethod) return fail(400, { message: 'Payment method required' });

		const db = getDb(platform.env.DB);
		await db.update(tableSessions)
			.set({ paymentStatus: 'paid', paymentMethod })
			.where(eq(tableSessions.id, params.id));
		return { success: true };
	},

	closeSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		await db.update(tableSessions)
			.set({ status: 'closed', closedAt: new Date() })
			.where(eq(tableSessions.id, params.id));
		return { success: true };
	}
};
