import { getDb } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, url }) => {
	// If platform is not available (e.g. during local dev without wrangler)
	if (!platform?.env.DB) {
		console.warn('D1 database not found in platform.env');
		return { menus: [], table: null };
	}

	const db = getDb(platform.env.DB);
	const tableId = url.searchParams.get('table');
	
	try {
		const [allMenus, table] = await Promise.all([
			db.query.menus.findMany({
				with: {
					category: true
				},
				limit: 8 // Only show a few on home page
			}),
			tableId ? db.query.tables.findFirst({ where: (t, { eq }) => eq(t.id, tableId) }) : Promise.resolve(null)
		]);

		return {
			menus: allMenus,
			table: table ?? null
		};
	} catch (error) {
		console.error('Error fetching data from D1:', error);
		return { menus: [], table: null };
	}
};
