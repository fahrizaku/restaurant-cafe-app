import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	if (!platform?.env.DB) return { sessions: [], currentStatus: null };

	const db = getDb(platform.env.DB);
	const status = url.searchParams.get('status') as typeof tableSessions.$inferSelect.status | null;

	const sessions = await db.query.tableSessions.findMany({
		where: status ? eq(tableSessions.status, status) : undefined,
		orderBy: (s, { desc }) => [desc(s.openedAt)],
		with: {
			table: true,
			batches: { with: { items: true } }
		}
	});

	return { sessions, currentStatus: status };
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
		await db
			.update(tableSessions)
			.set({ paymentStatus: 'paid', paymentMethod, status: 'processing' })
			.where(eq(tableSessions.id, id));
		return { success: true };
	},

	completeSession: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID required' });

		const db = getDb(platform.env.DB);
		await db
			.update(tableSessions)
			.set({ status: 'closed', closedAt: new Date() })
			.where(eq(tableSessions.id, id));
		return { success: true };
	},

	cancelSession: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;

		if (!id) return fail(400, { message: 'ID required' });

		const db = getDb(platform.env.DB);
		await db
			.update(tableSessions)
			.set({ status: 'cancelled', closedAt: new Date() })
			.where(eq(tableSessions.id, id));
		return { success: true };
	}
};
