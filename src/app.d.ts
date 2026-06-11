// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SafeUser } from '$lib/server/auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// Diisi hooks untuk semua route /admin (kecuali /admin/login)
			user?: SafeUser;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				BUCKET: R2Bucket;
				// Pusher (opsional — fitur realtime mati jika tidak diset)
				PUSHER_APP_ID?: string;
				PUSHER_KEY?: string;
				PUSHER_SECRET?: string;
				PUSHER_CLUSTER?: string;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
