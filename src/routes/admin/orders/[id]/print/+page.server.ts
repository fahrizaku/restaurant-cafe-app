import { getDb } from '$lib/server/db';
import { tableSessions, settings } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const [session, settingRows] = await Promise.all([
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
		db.select().from(settings).where(inArray(settings.key, ['cafe_name']))
	]);

	if (!session) error(404, 'Session not found');

	const cafeName = settingRows.find((r) => r.key === 'cafe_name')?.value?.trim() || 'Cafe';

	return { session, cafeName };
};
