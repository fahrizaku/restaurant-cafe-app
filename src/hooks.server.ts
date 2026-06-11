import { redirect, type Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';

// Halaman admin yang hanya boleh diakses owner
const OWNER_ONLY_PREFIXES = ['/admin/reports', '/admin/settings', '/admin/users'];

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;

	if (pathname.startsWith('/admin')) {
		// Halaman login terbuka (termasuk setup owner pertama kali)
		if (pathname.startsWith('/admin/login')) {
			return resolve(event);
		}

		// Tanpa DB (mis. prerender) — biarkan endpoint yang menangani errornya
		if (!event.platform?.env.DB) {
			return resolve(event);
		}

		const db = getDb(event.platform.env.DB);
		const token = event.cookies.get(SESSION_COOKIE);
		const user = token ? await validateSession(db, token) : null;

		if (!user) {
			redirect(302, `/admin/login?redirectTo=${encodeURIComponent(pathname)}`);
		}

		if (user.role !== 'owner' && OWNER_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) {
			redirect(302, '/admin');
		}

		event.locals.user = user;
	}

	return resolve(event);
};
