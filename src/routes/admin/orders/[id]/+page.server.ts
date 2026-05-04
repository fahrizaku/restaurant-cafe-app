import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
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
	markPaid: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const paymentMethod = data.get(
			'paymentMethod'
		) as typeof tableSessions.$inferSelect.paymentMethod;
		if (!paymentMethod) return fail(400, { message: 'Payment method required' });

		const db = getDb(platform.env.DB);
		await db
			.update(tableSessions)
			.set({ paymentStatus: 'paid', paymentMethod, status: 'processing' })
			.where(eq(tableSessions.id, params.id));
		return { success: true };
	},

	completeSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		await db
			.update(tableSessions)
			.set({ status: 'closed', closedAt: new Date() })
			.where(eq(tableSessions.id, params.id));
		return { success: true };
	},

	cancelSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		await db
			.update(tableSessions)
			.set({ status: 'cancelled', closedAt: new Date() })
			.where(eq(tableSessions.id, params.id));
		return { success: true };
	},

	reopenSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		await db
			.update(tableSessions)
			.set({ status: 'open', closedAt: null, paymentStatus: 'unpaid', paymentMethod: null })
			.where(eq(tableSessions.id, params.id));
		return { success: true };
	}
};
