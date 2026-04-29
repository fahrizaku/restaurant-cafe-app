import { getDb } from '$lib/server/db';
import { menus } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { menus: [], categories: [] };

	const db = getDb(platform.env.DB);
	const [allMenus, allCategories] = await Promise.all([
		db.query.menus.findMany({ with: { category: true }, orderBy: (m, { asc }) => [asc(m.name)] }),
		db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.name)] })
	]);

	return { menus: allMenus, categories: allCategories };
};

export const actions: Actions = {
	delete: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) return fail(400, { message: 'ID required' });

		const db = getDb(platform.env.DB);
		await db.delete(menus).where(eq(menus.id, id));
		return { success: true };
	}
};
