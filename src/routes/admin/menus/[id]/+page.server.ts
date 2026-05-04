import { getDb } from '$lib/server/db';
import { menus } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const [menu, categories] = await Promise.all([
		db.query.menus.findFirst({ where: eq(menus.id, params.id) }),
		db.query.categories.findMany({ orderBy: (c, { asc }) => [asc(c.name)] })
	]);

	if (!menu) error(404, 'Menu not found');
	return { menu, categories };
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const categoryId = data.get('categoryId') as string;
		const price = parseFloat(data.get('price') as string);
		const description = (data.get('description') as string)?.trim() || null;
		const image = (data.get('image') as string)?.trim() || null;
		const isAvailable = data.get('isAvailable') === 'on';

		if (!name) return fail(400, { message: 'Name is required' });
		if (!categoryId) return fail(400, { message: 'Category is required' });
		if (isNaN(price) || price < 0) return fail(400, { message: 'Valid price is required' });

		const db = getDb(platform.env.DB);
		await db
			.update(menus)
			.set({ name, categoryId, price, description, image, isAvailable })
			.where(eq(menus.id, params.id));

		redirect(303, '/admin/menus');
	}
};
