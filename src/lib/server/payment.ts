import { getDb } from '$lib/server/db';
import { tableSessions } from '$lib/server/db/schema';
import { pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { eq, and, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { ActionFailure } from '@sveltejs/kit';

const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};

/**
 * Customer klaim sudah transfer: simpan bukti ke R2, set paymentStatus 'pending',
 * notifikasi kasir. Boleh diulang saat masih 'pending' (ganti bukti).
 */
export async function requestTransfer(
	platform: App.Platform | undefined,
	sessionId: string,
	proof: unknown
): Promise<ActionFailure<{ message: string }> | { success: true }> {
	if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });

	if (!(proof instanceof File) || proof.size === 0) {
		return fail(400, { message: 'Bukti transfer wajib dilampirkan' });
	}
	const ext = ALLOWED_TYPES[proof.type];
	if (!ext) {
		return fail(400, { message: 'Format bukti harus JPG, PNG, atau WebP' });
	}
	if (proof.size > MAX_PROOF_SIZE) {
		return fail(400, { message: 'Ukuran bukti maksimal 5 MB' });
	}

	const db = getDb(platform.env.DB);
	const session = await db.query.tableSessions.findFirst({
		where: eq(tableSessions.id, sessionId)
	});
	if (!session) return fail(404, { message: 'Sesi tidak ditemukan' });
	if (session.paymentStatus === 'paid') {
		return fail(400, { message: 'Tagihan ini sudah lunas' });
	}
	if (session.status !== 'open' && session.status !== 'processing') {
		return fail(400, { message: 'Sesi sudah ditutup' });
	}
	if (session.totalPrice <= 0) {
		return fail(400, { message: 'Belum ada tagihan untuk dibayar' });
	}

	const key = `payment-proofs/${sessionId}/${Date.now()}.${ext}`;
	await platform.env.BUCKET.put(key, await proof.arrayBuffer(), {
		httpMetadata: { contentType: proof.type }
	});

	await db
		.update(tableSessions)
		.set({ paymentStatus: 'pending', paymentMethod: 'transfer', paymentProof: key })
		.where(
			and(
				eq(tableSessions.id, sessionId),
				inArray(tableSessions.paymentStatus, ['unpaid', 'pending'])
			)
		);

	await pusherTrigger(
		platform.env,
		sessionChannels(sessionId, session.tableId),
		'payment-requested',
		{ sessionId }
	);

	return { success: true };
}
