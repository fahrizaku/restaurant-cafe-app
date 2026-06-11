import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import { processOrder } from '$lib/server/order';
import { rememberTable, resolveTableId } from '$lib/server/table-context';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ url, platform, cookies }) => {
	const tableId = resolveTableId(url, cookies);
	const sessionId = cookies.get('session_id');

	if (!platform?.env.DB) error(500, 'Service unavailable');
	const db = getDb(platform.env.DB);

	let activeSession = null;
	let table = null;

	if (tableId) {
		[table, activeSession] = await Promise.all([
			db.query.tables.findFirst({ where: (t, { eq }) => eq(t.id, tableId) }),
			db.query.tableSessions.findFirst({
				where: and(eq(tableSessions.tableId, tableId), eq(tableSessions.status, 'open'))
			})
		]);
	} else if (sessionId) {
		activeSession = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.id, sessionId), eq(tableSessions.status, 'open'))
		});
	}

	if (table) rememberTable(cookies, table.id);

	return { tableId: table?.id ?? null, table, activeSession };
};

export const actions: Actions = {
	order: async ({ request, platform, cookies }) => {
		const data = await request.formData();
		const tableId = (data.get('tableId') as string) || null;
		const customerName = (data.get('customerName') as string) || null;
		const itemsJson = data.get('items') as string;

		if (!itemsJson) return fail(400, { message: 'Invalid order data' });

		let rawItems: Array<{ menuId: string; quantity: number }>;
		try {
			rawItems = JSON.parse(itemsJson);
		} catch {
			return fail(400, { message: 'Invalid items data' });
		}

		const result = await processOrder(platform, cookies, tableId, customerName, rawItems);
		if ('status' in result) return result;

		redirect(303, result.tableId ? `/table/${result.tableId}` : `/order/status/${result.sessionId}`);
	}
};
