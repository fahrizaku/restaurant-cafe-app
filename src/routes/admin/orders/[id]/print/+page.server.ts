import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getCafeName } from '$lib/server/settings';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const [session, cafeName] = await Promise.all([
		db.query.tableSessions.findFirst({
			where: eq(tableSessions.id, params.id),
			with: {
				table: true,
				batches: {
					orderBy: (b, { asc }) => [asc(b.createdAt)],
					with: { items: { with: { menu: true } } }
				}
			}
		}),
		getCafeName(db)
	]);

	if (!session) error(404, 'Session not found');

	return { session, cafeName };
};
