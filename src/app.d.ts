// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				BUCKET: R2Bucket;
				ADMIN_PASSWORD?: string;
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
