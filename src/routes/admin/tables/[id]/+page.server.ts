import { getDb } from '$lib/server/db';
import { tables } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');
	const db = getDb(platform.env.DB);
	const table = await db.query.tables.findFirst({ where: eq(tables.id, params.id) });
	if (!table) error(404, 'Table not found');
	return { table };
};

export const actions: Actions = {
	default: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();

		if (!name) return fail(400, { message: 'Name is required' });

		const db = getDb(platform.env.DB);
		await db.update(tables).set({ name }).where(eq(tables.id, params.id));
		redirect(303, '/admin/tables');
	}
};
