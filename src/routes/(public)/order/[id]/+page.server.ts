import { redirect } from '@sveltejs/kit';

// URL lama /order/[id] sudah tidak dipakai sejak model Table Bill
export const load = async () => {
	redirect(307, '/');
};
