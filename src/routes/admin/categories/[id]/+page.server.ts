import { getDb } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');
	const db = getDb(platform.env.DB);
	const category = await db.query.categories.findFirst({ where: eq(categories.id, params.id) });
	if (!category) error(404, 'Category not found');
	return { category };
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const order = parseInt(data.get('order') as string) || 0;

		if (!name) return fail(400, { message: 'Name is required' });

		const db = getDb(platform.env.DB);
		await db.update(categories).set({ name, order }).where(eq(categories.id, params.id));
		redirect(303, '/admin/categories');
	}
};
