import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, platform }) => {
	const sessionId = cookies.get('session_id');

	if (sessionId && platform?.env.DB) {
		const db = getDb(platform.env.DB);
		const activeSession = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.id, sessionId), eq(tableSessions.status, 'open'))
		});

		return {
			activeSessionId: activeSession?.id ?? null,
			tableId: activeSession?.tableId ?? null
		};
	}

	return {
		activeSessionId: null,
		tableId: null
	};
};
