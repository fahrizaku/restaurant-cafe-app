import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const table = await db.query.tables.findFirst({
		where: (t, { eq }) => eq(t.id, params.id)
	});

	if (!table) error(404, 'Table not found');

	// Ambil sesi aktif beserta semua batch dan item-nya
	const session = await db.query.tableSessions.findFirst({
		where: and(eq(tableSessions.tableId, params.id), eq(tableSessions.status, 'open')),
		with: {
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

	return { table, session: session ?? null };
};
