// Helper Pusher sisi client. Satu koneksi dipakai bersama semua halaman.
// Dynamic import agar pusher-js tidak ikut bundle SSR (butuh window).
import type PusherType from 'pusher-js';

export interface RealtimeConfig {
	key: string;
	cluster: string;
}

let client: PusherType | null = null;
// Hitung subscriber per channel: beberapa komponen (Header + halaman) bisa
// mendengarkan channel yang sama — unsubscribe hanya saat subscriber habis,
// agar cleanup satu komponen tidak mematikan listener komponen lain.
const refCounts = new Map<string, number>();

/**
 * Subscribe ke satu channel; onEvent dipanggil untuk semua event aplikasi
 * (event internal `pusher:*` diabaikan). Mengembalikan fungsi cleanup.
 * Jika config null (Pusher belum dikonfigurasi), tidak melakukan apa-apa.
 */
export function subscribeRealtime(
	config: RealtimeConfig | null | undefined,
	channelName: string,
	onEvent: (event: string, data: unknown) => void
): () => void {
	if (!config) return () => {};

	let cancelled = false;
	let cleanup = () => {};

	import('pusher-js').then(({ default: Pusher }) => {
		if (cancelled) return;
		if (!client) {
			client = new Pusher(config.key, { cluster: config.cluster });
		}
		const channel = client.subscribe(channelName);
		refCounts.set(channelName, (refCounts.get(channelName) ?? 0) + 1);

		const handler = (event: string, data: unknown) => {
			if (!event.startsWith('pusher:')) onEvent(event, data);
		};
		channel.bind_global(handler);

		cleanup = () => {
			channel.unbind_global(handler);
			const remaining = (refCounts.get(channelName) ?? 1) - 1;
			if (remaining <= 0) {
				refCounts.delete(channelName);
				client?.unsubscribe(channelName);
			} else {
				refCounts.set(channelName, remaining);
			}
		};
	});

	return () => {
		cancelled = true;
		cleanup();
	};
}
