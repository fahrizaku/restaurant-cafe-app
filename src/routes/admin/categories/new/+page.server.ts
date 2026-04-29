import { getDb } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const order = parseInt(data.get('order') as string) || 0;

		if (!name) return fail(400, { message: 'Name is required' });

		const db = getDb(platform.env.DB);
		await db.insert(categories).values({ id: crypto.randomUUID(), name, order });
		redirect(303, '/admin/categories');
	}
};
