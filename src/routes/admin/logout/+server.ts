import { getDb } from '$lib/server/db';
import { destroySession, SESSION_COOKIE } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ platform, cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token && platform?.env.DB) {
		await destroySession(getDb(platform.env.DB), token, cookies);
	} else {
		cookies.delete(SESSION_COOKIE, { path: '/' });
	}
	redirect(302, '/admin/login');
};
