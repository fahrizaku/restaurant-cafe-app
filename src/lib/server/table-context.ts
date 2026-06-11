import type { Cookies } from '@sveltejs/kit';

// Konteks meja dibawa lewat ?table= saat scan QR, lalu diingat di cookie
// agar tidak hilang saat customer berpindah halaman tanpa query param
// (mis. dari /table/T-01 kembali ke /menu lewat navbar).

const COOKIE_NAME = 'table_id';
const MAX_AGE = 60 * 60 * 6; // 6 jam — kira-kira satu kunjungan cafe

export function rememberTable(cookies: Cookies, tableId: string) {
	cookies.set(COOKIE_NAME, tableId, { path: '/', maxAge: MAX_AGE });
}

/** URL param menang (scan QR meja baru menimpa cookie lama). */
export function resolveTableId(url: URL, cookies: Cookies): string | null {
	return url.searchParams.get('table') || cookies.get(COOKIE_NAME) || null;
}
