import { getDb } from '$lib/server/db';
import { tables } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { tables: [] };
	const db = getDb(platform.env.DB);
	const all = await db.query.tables.findMany({
		orderBy: (t, { asc }) => [asc(t.name)],
		with: { orders: true }
	});
	return { tables: all };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'ID required' });
		const db = getDb(platform.env.DB);
		await db.delete(tables).where(eq(tables.id, id));
		return { success: true };
	}
};
