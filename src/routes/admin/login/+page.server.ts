import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import {
	createSession,
	hashPassword,
	isSetupNeeded,
	pruneExpiredSessions,
	SESSION_COOKIE,
	validateSession,
	verifyPassword
} from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function safeRedirectTo(raw: string | null): string {
	// Hanya path internal /admin agar tidak jadi open redirect
	if (raw && raw.startsWith('/admin') && !raw.startsWith('//')) return raw;
	return '/admin';
}

export const load: PageServerLoad = async ({ platform, cookies, url }) => {
	if (!platform?.env.DB) return { setupNeeded: false };

	const db = getDb(platform.env.DB);

	// Sudah login → langsung ke admin
	const token = cookies.get(SESSION_COOKIE);
	if (token && (await validateSession(db, token))) {
		redirect(302, safeRedirectTo(url.searchParams.get('redirectTo')));
	}

	return { setupNeeded: await isSetupNeeded(db) };
};

export const actions: Actions = {
	login: async ({ request, platform, cookies, url }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const username = ((data.get('username') as string) ?? '').trim().toLowerCase();
		const password = (data.get('password') as string) ?? '';
		if (!username || !password) {
			return fail(400, { message: 'Username dan password wajib diisi' });
		}

		const db = getDb(platform.env.DB);
		const user = await db.query.users.findFirst({ where: eq(users.username, username) });
		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { message: 'Username atau password salah' });
		}

		await pruneExpiredSessions(db);
		await createSession(db, user.id, cookies);
		redirect(302, safeRedirectTo(url.searchParams.get('redirectTo')));
	},

	// Setup owner pertama kali — hanya jika belum ada user sama sekali
	setup: async ({ request, platform, cookies }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const db = getDb(platform.env.DB);
		if (!(await isSetupNeeded(db))) {
			return fail(400, { message: 'Akun sudah ada — silakan login' });
		}

		const data = await request.formData();
		const name = ((data.get('name') as string) ?? '').trim().slice(0, 100);
		const username = ((data.get('username') as string) ?? '').trim().toLowerCase();
		const password = (data.get('password') as string) ?? '';

		if (!name || !username) return fail(400, { message: 'Nama dan username wajib diisi' });
		if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
			return fail(400, { message: 'Username 3–30 karakter: huruf kecil, angka, _ . -' });
		}
		if (password.length < 8) {
			return fail(400, { message: 'Password minimal 8 karakter' });
		}

		const [owner] = await db
			.insert(users)
			.values({ name, username, passwordHash: await hashPassword(password), role: 'owner' })
			.returning({ id: users.id });

		await createSession(db, owner.id, cookies);
		redirect(302, '/admin');
	}
};
