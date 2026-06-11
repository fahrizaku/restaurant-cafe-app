import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Sistem meja tidak dipakai lagi di sisi customer — QR lama per meja
// tetap berfungsi dengan mengarahkan ke menu.
export const load: PageServerLoad = async () => {
	redirect(301, '/menu');
};
