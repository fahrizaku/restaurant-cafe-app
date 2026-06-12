import { getDb } from '$lib/server/db';
import { getCafeName } from '$lib/server/settings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ platform }) => {
	// Tanpa DB (mis. prerender) tetap jalan dengan fallback
	if (!platform?.env.DB) return { cafeName: 'Cafe' };
	return { cafeName: await getCafeName(getDb(platform.env.DB)) };
};
