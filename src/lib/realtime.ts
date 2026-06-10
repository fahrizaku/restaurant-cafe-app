// Helper Pusher sisi client. Satu koneksi dipakai bersama semua halaman.
// Dynamic import agar pusher-js tidak ikut bundle SSR (butuh window).
import type PusherType from 'pusher-js';

export interface RealtimeConfig {
	key: string;
	cluster: string;
}

let client: PusherType | null = null;

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

	let unsubscribe = () => {};

	import('pusher-js').then(({ default: Pusher }) => {
		if (!client) {
			client = new Pusher(config.key, { cluster: config.cluster });
		}
		const channel = client.subscribe(channelName);
		channel.bind_global((event: string, data: unknown) => {
			if (!event.startsWith('pusher:')) onEvent(event, data);
		});
		unsubscribe = () => client!.unsubscribe(channelName);
	});

	return () => unsubscribe();
}
