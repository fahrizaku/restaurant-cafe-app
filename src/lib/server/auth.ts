// Auth admin berbasis cookie session. Password di-hash PBKDF2-SHA256 (Web Crypto,
// jalan di Cloudflare Workers tanpa dependensi Node).
import { users, authSessions } from '$lib/server/db/schema';
import { eq, lt } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';
import type { Cookies } from '@sveltejs/kit';

type Db = ReturnType<typeof getDb>;

export type SafeUser = {
	id: string;
	username: string;
	name: string;
	role: 'owner' | 'cashier';
};

export const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const PBKDF2_ITERATIONS = 100_000;

function toHex(buf: ArrayBuffer | Uint8Array): string {
	return [...new Uint8Array(buf as ArrayBuffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex: string): Uint8Array {
	const out = new Uint8Array(hex.length / 2);
	for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	return out;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
		key,
		256
	);
	return toHex(bits);
}

/** Hash password baru. Format: pbkdf2$<iterations>$<salt_hex>$<hash_hex> */
export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
	return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [scheme, iterStr, saltHex, hashHex] = stored.split('$');
	if (scheme !== 'pbkdf2' || !iterStr || !saltHex || !hashHex) return false;
	const computed = await pbkdf2(password, fromHex(saltHex), parseInt(iterStr, 10));
	// Perbandingan constant-time sederhana
	if (computed.length !== hashHex.length) return false;
	let diff = 0;
	for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ hashHex.charCodeAt(i);
	return diff === 0;
}

async function sha256Hex(input: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	return toHex(digest);
}

/** Buat sesi login baru; set cookie. Mengembalikan token mentah (untuk debugging/test). */
export async function createSession(db: Db, userId: string, cookies: Cookies): Promise<string> {
	const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	await db.insert(authSessions).values({ id: await sha256Hex(token), userId, expiresAt });
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: SESSION_DURATION_MS / 1000
	});
	return token;
}

/** Validasi token cookie; null jika tidak ada/kedaluwarsa. Sesi kedaluwarsa ikut dibersihkan. */
export async function validateSession(db: Db, token: string): Promise<SafeUser | null> {
	const id = await sha256Hex(token);
	const session = await db.query.authSessions.findFirst({
		where: eq(authSessions.id, id),
		with: { user: true }
	});
	if (!session) return null;
	if (session.expiresAt.getTime() < Date.now()) {
		await db.delete(authSessions).where(eq(authSessions.id, id));
		return null;
	}
	const { user } = session;
	return { id: user.id, username: user.username, name: user.name, role: user.role };
}

/** Hapus sesi (logout) + clear cookie. */
export async function destroySession(db: Db, token: string, cookies: Cookies): Promise<void> {
	await db.delete(authSessions).where(eq(authSessions.id, await sha256Hex(token)));
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Hapus semua sesi milik satu user (mis. setelah ganti password / hapus akun). */
export async function destroyUserSessions(db: Db, userId: string): Promise<void> {
	await db.delete(authSessions).where(eq(authSessions.userId, userId));
}

/** Bersihkan sesi kedaluwarsa (dipanggil best-effort saat login). */
export async function pruneExpiredSessions(db: Db): Promise<void> {
	await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
}

/** True jika belum ada user sama sekali (mode setup pertama kali). */
export async function isSetupNeeded(db: Db): Promise<boolean> {
	const first = await db.select({ id: users.id }).from(users).limit(1);
	return first.length === 0;
}
