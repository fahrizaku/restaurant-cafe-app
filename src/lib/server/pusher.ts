// Trigger event Pusher via REST API langsung (tanpa SDK Node, kompatibel Cloudflare Workers).
// Jika env Pusher tidak diset, semua fungsi jadi no-op agar app tetap jalan tanpa Pusher.

type Env = App.Platform['env'];

function toHex(buffer: ArrayBuffer): string {
	return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function md5Hex(body: string): Promise<string> {
	const bytes = new TextEncoder().encode(body);
	try {
		// workerd mendukung MD5 di Web Crypto (ekstensi non-standar)
		return toHex(await crypto.subtle.digest('MD5', bytes));
	} catch {
		// Node (vite dev) tidak — pakai node:crypto
		const { createHash } = await import('node:crypto');
		return createHash('md5').update(body).digest('hex');
	}
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Konfigurasi yang aman dikirim ke browser (key publik + cluster). */
export function pusherClientConfig(env: Env | undefined): { key: string; cluster: string } | null {
	if (!env?.PUSHER_KEY || !env?.PUSHER_CLUSTER) return null;
	return { key: env.PUSHER_KEY, cluster: env.PUSHER_CLUSTER };
}

/** Daftar channel yang relevan untuk satu sesi: admin + halaman status customer. */
export function sessionChannels(sessionId: string, tableId?: string | null): string[] {
	return ['admin-orders', `session-${sessionId}`, ...(tableId ? [`table-${tableId}`] : [])];
}

/**
 * Kirim satu event ke beberapa channel sekaligus.
 * Tidak pernah throw — kegagalan notifikasi tidak boleh menggagalkan order.
 */
export async function pusherTrigger(
	env: Env | undefined,
	channels: string[],
	event: string,
	data: unknown
): Promise<void> {
	if (!env?.PUSHER_APP_ID || !env.PUSHER_KEY || !env.PUSHER_SECRET || !env.PUSHER_CLUSTER) return;

	try {
		const body = JSON.stringify({ name: event, channels, data: JSON.stringify(data) });
		const path = `/apps/${env.PUSHER_APP_ID}/events`;
		const query = [
			`auth_key=${env.PUSHER_KEY}`,
			`auth_timestamp=${Math.floor(Date.now() / 1000)}`,
			'auth_version=1.0',
			`body_md5=${await md5Hex(body)}`
		].join('&');
		const signature = await hmacSha256Hex(env.PUSHER_SECRET, `POST\n${path}\n${query}`);

		const res = await fetch(
			`https://api-${env.PUSHER_CLUSTER}.pusher.com${path}?${query}&auth_signature=${signature}`,
			{ method: 'POST', headers: { 'Content-Type': 'application/json' }, body }
		);
		if (!res.ok) {
			console.error('Pusher trigger gagal:', res.status, await res.text());
		}
	} catch (err) {
		console.error('Pusher trigger error:', err);
	}
}
