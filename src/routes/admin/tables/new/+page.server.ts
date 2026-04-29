import { getDb } from '$lib/server/db';
import { tables } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const id = (data.get('id') as string)?.trim().toUpperCase();
		const name = (data.get('name') as string)?.trim();

		if (!id) return fail(400, { message: 'Table ID is required' });
		if (!name) return fail(400, { message: 'Name is required' });

		const db = getDb(platform.env.DB);
		await db.insert(tables).values({ id, name });
		redirect(303, '/admin/tables');
	}
};
