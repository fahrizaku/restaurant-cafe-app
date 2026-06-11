import { type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/admin')) {
		const password = event.platform?.env.ADMIN_PASSWORD;

		// Jika env tidak diset, akses admin dibiarkan terbuka (mode dev tanpa password)
		if (password) {
			const authHeader = event.request.headers.get('authorization') ?? '';
			const [scheme, encoded] = authHeader.split(' ');

			let authorized = false;
			if (scheme === 'Basic' && encoded) {
				const decoded = atob(encoded);
				const colonIdx = decoded.indexOf(':');
				const inputPassword = colonIdx !== -1 ? decoded.slice(colonIdx + 1) : decoded;
				authorized = inputPassword === password;
			}

			if (!authorized) {
				return new Response('Unauthorized', {
					status: 401,
					headers: { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"' }
				});
			}
		}
	}

	return resolve(event);
};
