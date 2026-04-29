import { getDb } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { categories: [] };
	const db = getDb(platform.env.DB);
	const all = await db.query.categories.findMany({
		orderBy: (c, { asc }) => [asc(c.order), asc(c.name)],
		with: { menus: true }
	});
	return { categories: all };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });
		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'ID required' });
		const db = getDb(platform.env.DB);
		await db.delete(categories).where(eq(categories.id, id));
		return { success: true };
	}
};
