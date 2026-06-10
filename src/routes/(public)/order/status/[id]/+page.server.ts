import { getDb } from '$lib/server/db';
import { pusherClientConfig } from '$lib/server/pusher';
import { tableSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const session = await db.query.tableSessions.findFirst({
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
	});

	if (!session) error(404, 'Pesanan tidak ditemukan');

	return { session, pusher: pusherClientConfig(platform.env) };
};
