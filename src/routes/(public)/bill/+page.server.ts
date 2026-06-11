import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Resolver tagihan: arahkan ke tagihan yang tepat berdasarkan cookie,
// atau tampilkan empty state jika belum ada konteks sama sekali.
export const load: PageServerLoad = async ({ platform, cookies }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');
	const db = getDb(platform.env.DB);

	const tableId = cookies.get('table_id');
	if (tableId) {
		const table = await db.query.tables.findFirst({ where: (t, { eq }) => eq(t.id, tableId) });
		if (table) redirect(303, `/table/${table.id}`);
	}

	const sessionId = cookies.get('session_id');
	if (sessionId) {
		const session = await db.query.tableSessions.findFirst({
			where: eq(tableSessions.id, sessionId)
		});
		if (session) redirect(303, `/order/status/${session.id}`);
	}

	return {};
};
