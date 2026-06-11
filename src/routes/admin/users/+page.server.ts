import { getDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { destroyUserSessions, hashPassword } from '$lib/server/auth';
import { eq, and, ne } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform, locals }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const list = await db
		.select({
			id: users.id,
			username: users.username,
			name: users.name,
			role: users.role,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(users.createdAt);

	return { users: list, currentUserId: locals.user!.id };
};

export const actions: Actions = {
	createUser: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const name = ((data.get('name') as string) ?? '').trim().slice(0, 100);
		const username = ((data.get('username') as string) ?? '').trim().toLowerCase();
		const password = (data.get('password') as string) ?? '';
		const role = data.get('role') as string;

		if (!name || !username) return fail(400, { message: 'Nama dan username wajib diisi' });
		if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
			return fail(400, { message: 'Username 3–30 karakter: huruf kecil, angka, _ . -' });
		}
		if (password.length < 8) return fail(400, { message: 'Password minimal 8 karakter' });
		if (role !== 'owner' && role !== 'cashier') return fail(400, { message: 'Role tidak valid' });

		const db = getDb(platform.env.DB);
		const existing = await db.query.users.findFirst({ where: eq(users.username, username) });
		if (existing) return fail(400, { message: 'Username sudah dipakai' });

		await db.insert(users).values({ name, username, passwordHash: await hashPassword(password), role });
		return { success: true };
	},

	resetPassword: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const userId = (data.get('userId') as string) ?? '';
		const password = (data.get('password') as string) ?? '';
		if (!userId) return fail(400, { message: 'User tidak valid' });
		if (password.length < 8) return fail(400, { message: 'Password minimal 8 karakter' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(users)
			.set({ passwordHash: await hashPassword(password) })
			.where(eq(users.id, userId))
			.returning({ id: users.id });
		if (!updated) return fail(404, { message: 'User tidak ditemukan' });

		// Paksa login ulang di semua perangkat
		await destroyUserSessions(db, userId);
		return { success: true };
	},

	deleteUser: async ({ request, platform, locals }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const userId = (data.get('userId') as string) ?? '';
		if (!userId) return fail(400, { message: 'User tidak valid' });
		if (userId === locals.user!.id) {
			return fail(400, { message: 'Tidak bisa menghapus akun sendiri' });
		}

		const db = getDb(platform.env.DB);
		const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
		if (!target) return fail(404, { message: 'User tidak ditemukan' });

		// Jaga minimal satu owner tersisa
		if (target.role === 'owner') {
			const otherOwner = await db.query.users.findFirst({
				where: and(eq(users.role, 'owner'), ne(users.id, userId))
			});
			if (!otherOwner) return fail(400, { message: 'Tidak bisa menghapus owner terakhir' });
		}

		await destroyUserSessions(db, userId);
		await db.delete(users).where(eq(users.id, userId));
		return { success: true };
	}
};
