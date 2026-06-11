import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Stream bukti transfer dari R2 — hanya untuk admin (terlindungi Basic Auth via hooks)
export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform?.env.BUCKET) error(500, 'Storage tidak tersedia');

	// Batasi hanya ke prefix bukti transfer
	if (!params.key.startsWith('payment-proofs/')) error(404, 'Tidak ditemukan');

	const object = await platform.env.BUCKET.get(params.key);
	if (!object) error(404, 'Tidak ditemukan');

	return new Response(object.body, {
		headers: {
			'Content-Type': object.httpMetadata?.contentType ?? 'image/jpeg',
			'Cache-Control': 'private, max-age=3600'
		}
	});
};
