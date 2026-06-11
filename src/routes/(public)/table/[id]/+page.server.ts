import { getDb } from '$lib/server/db';
import { pusherClientConfig } from '$lib/server/pusher';
import { tableSessions } from '$lib/server/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { rememberTable } from '$lib/server/table-context';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const table = await db.query.tables.findFirst({
		where: (t, { eq }) => eq(t.id, params.id)
	});

	if (!table) error(404, 'Table not found');

	// Ingat meja agar konteks tidak hilang saat kembali ke /menu lewat navbar
	rememberTable(cookies, table.id);

	// Ambil sesi aktif beserta semua batch dan item-nya
	const session = await db.query.tableSessions.findFirst({
		where: and(
			eq(tableSessions.tableId, params.id),
			or(eq(tableSessions.status, 'open'), eq(tableSessions.status, 'processing'))
		),
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

	return { table, session: session ?? null, pusher: pusherClientConfig(platform.env) };
};
