import { getDb } from '$lib/server/db';
import { pusherClientConfig } from '$lib/server/pusher';
import { tableSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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
	}
};
