import { getDb } from '$lib/server/db';
import { settings } from '$lib/server/db/schema';
import { setSetting } from '$lib/server/settings';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) return { settings: {} as Record<string, string> };

	const db = getDb(platform.env.DB);
	const rows = await db.select().from(settings);

	return { settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) };
};

export const actions: Actions = {
	saveCafe: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const cafeName = ((data.get('cafeName') as string) ?? '').trim().slice(0, 100);

		const db = getDb(platform.env.DB);
		await setSetting(db, 'cafe_name', cafeName);

		return { success: true };
	},

	saveBank: async ({ request, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB tidak tersedia' });

		const data = await request.formData();
		const bankName = ((data.get('bankName') as string) ?? '').trim();
		const bankAccount = ((data.get('bankAccount') as string) ?? '').trim();
		const bankHolder = ((data.get('bankHolder') as string) ?? '').trim();

		// Boleh dikosongkan semua (menonaktifkan opsi transfer), tapi jika diisi
		// nama bank dan nomor rekening wajib lengkap
		if ((bankName || bankAccount) && (!bankName || !bankAccount)) {
			return fail(400, { message: 'Nama bank dan nomor rekening harus diisi keduanya' });
		}
		if (bankAccount && !/^[0-9 -]+$/.test(bankAccount)) {
			return fail(400, { message: 'Nomor rekening hanya boleh berisi angka' });
		}

		const db = getDb(platform.env.DB);
		await setSetting(db, 'bank_name', bankName);
		await setSetting(db, 'bank_account', bankAccount);
		await setSetting(db, 'bank_holder', bankHolder);

		return { success: true };
	}
};
