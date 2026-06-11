import { getDb } from '$lib/server/db';
import { fail, redirect } from '@sveltejs/kit';
import { processOrder } from '$lib/server/order';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { tables: [], categories: [] };

	const db = getDb(platform.env.DB);

	const [tables, categories] = await Promise.all([
		db.query.tables.findMany({
			orderBy: (t, { asc }) => [asc(t.name)],
			with: {
				sessions: {
					where: (s, { eq }) => eq(s.status, 'open'),
					limit: 1
				}
			}
		}),
		db.query.categories.findMany({
			orderBy: (c, { asc }) => [asc(c.order), asc(c.name)],
			with: {
				menus: {
					where: (m, { eq }) => eq(m.isAvailable, true),
					orderBy: (m, { asc }) => [asc(m.name)]
				}
			}
		})
	]);

	return {
		tables,
		categories: categories.filter((c) => c.menus.length > 0)
	};
};

export const actions: Actions = {
	order: async ({ request, platform }) => {
		const data = await request.formData();
		const tableId = (data.get('tableId') as string) || null;
		const customerName = (data.get('customerName') as string) || null;
		const itemsJson = data.get('items') as string;

		if ((!tableId && !customerName) || !itemsJson) {
			return fail(400, { message: 'Meja atau Nama Pelanggan diperlukan' });
		}

		let rawItems: Array<{ menuId: string; quantity: number; notes?: string }>;
		try {
			rawItems = JSON.parse(itemsJson);
		} catch {
			return fail(400, { message: 'Format data tidak valid' });
		}

		// cookies = null: order POS tidak terikat browser kasir,
		// takeaway selalu membuat sesi baru
		const result = await processOrder(platform, null, tableId, customerName, rawItems);
		if ('status' in result) return result;

		redirect(303, `/admin/orders/${result.sessionId}`);
	}
};
