import { getDb } from '$lib/server/db';
import { pusherClientConfig, pusherTrigger, sessionChannels } from '$lib/server/pusher';
import { tableSessions, orderBatches } from '$lib/server/db/schema';
import { eq, and, inArray, sql, ne } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) error(500, 'DB not available');

	const db = getDb(platform.env.DB);
	const session = await db.query.tableSessions.findFirst({
		where: eq(tableSessions.id, params.id),
		with: {
			table: true,
			batches: {
				orderBy: (b, { desc }) => [desc(b.createdAt)],
				with: { items: { with: { menu: true } } }
			}
		}
	});

	if (!session) error(404, 'Session not found');
	return { session, pusher: pusherClientConfig(platform.env) };
};

export const actions: Actions = {
	markPaid: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const paymentMethod = data.get(
			'paymentMethod'
		) as typeof tableSessions.$inferSelect.paymentMethod;
		if (!paymentMethod) return fail(400, { message: 'Payment method required' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ paymentStatus: 'paid', paymentMethod, status: 'processing' })
			.where(eq(tableSessions.id, params.id))
			.returning({ tableId: tableSessions.tableId });
		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	completeSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		// Hanya sesi yang sudah dibayar yang boleh diselesaikan
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'closed', closedAt: new Date() })
			.where(and(eq(tableSessions.id, params.id), eq(tableSessions.paymentStatus, 'paid')))
			.returning({ tableId: tableSessions.tableId });
		if (!updated) {
			return fail(400, { message: 'Sesi belum dibayar — tandai lunas terlebih dahulu.' });
		}
		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	cancelSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		const [updated] = await db
			.update(tableSessions)
			.set({ status: 'cancelled', closedAt: new Date() })
			.where(eq(tableSessions.id, params.id))
			.returning({ tableId: tableSessions.tableId });

		// Batalkan semua batch yang belum selesai dalam sesi ini
		await db
			.update(orderBatches)
			.set({ status: 'cancelled' })
			.where(
				and(
					eq(orderBatches.sessionId, params.id),
					inArray(orderBatches.status, ['pending', 'processing'])
				)
			);

		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	reopenSession: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		const session = await db.query.tableSessions.findFirst({
			where: eq(tableSessions.id, params.id)
		});
		if (!session) return fail(404, { message: 'Sesi tidak ditemukan' });
		if (session.status === 'open') return { success: true };

		// Cegah pelanggaran unique index: satu meja hanya boleh punya satu sesi open
		if (session.tableId) {
			const conflict = await db.query.tableSessions.findFirst({
				where: and(
					eq(tableSessions.tableId, session.tableId),
					eq(tableSessions.status, 'open'),
					ne(tableSessions.id, params.id)
				)
			});
			if (conflict) {
				return fail(400, {
					message: 'Meja ini sudah punya sesi aktif lain. Tutup sesi tersebut terlebih dahulu.'
				});
			}
		}

		// Pertahankan catatan pembayaran sebelumnya
		const reopen = db
			.update(tableSessions)
			.set({
				status: 'open',
				closedAt: null,
				// Total selalu = jumlah batch yang tidak dibatalkan
				totalPrice: sql`(SELECT coalesce(sum(total_price), 0) FROM order_batches WHERE session_id = ${params.id} AND status != 'cancelled')`
			})
			.where(eq(tableSessions.id, params.id));

		if (session.status === 'cancelled') {
			// Pulihkan batch yang ikut dibatalkan saat sesi dibatalkan
			await db.batch([
				db
					.update(orderBatches)
					.set({ status: 'pending' })
					.where(
						and(eq(orderBatches.sessionId, params.id), eq(orderBatches.status, 'cancelled'))
					),
				reopen
			]);
		} else {
			await reopen;
		}

		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, session.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	rejectTransfer: async ({ params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const db = getDb(platform.env.DB);
		const session = await db.query.tableSessions.findFirst({
			where: eq(tableSessions.id, params.id)
		});
		if (!session) return fail(404, { message: 'Sesi tidak ditemukan' });
		if (session.paymentStatus !== 'pending') {
			return fail(400, { message: 'Tidak ada klaim transfer yang menunggu konfirmasi' });
		}

		await db
			.update(tableSessions)
			.set({ paymentStatus: 'unpaid', paymentMethod: null, paymentProof: null })
			.where(eq(tableSessions.id, params.id));

		// Hapus bukti dari R2 (best-effort)
		if (session.paymentProof && platform.env.BUCKET) {
			try {
				await platform.env.BUCKET.delete(session.paymentProof);
			} catch {
				// abaikan — objek yatim tidak mengganggu
			}
		}

		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, session.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	},

	updateBatchStatus: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'DB not available' });

		const data = await request.formData();
		const batchId = data.get('batchId') as string;
		const status = data.get('status') as typeof orderBatches.$inferSelect.status;

		if (!batchId || !['pending', 'processing', 'done', 'cancelled'].includes(status)) {
			return fail(400, { message: 'Data tidak valid' });
		}

		const db = getDb(platform.env.DB);
		const batch = await db.query.orderBatches.findFirst({
			where: and(eq(orderBatches.id, batchId), eq(orderBatches.sessionId, params.id))
		});
		if (!batch) return fail(404, { message: 'Batch tidak ditemukan' });
		if (batch.status === status) return { success: true };

		const [, [updated]] = await db.batch([
			db.update(orderBatches).set({ status }).where(eq(orderBatches.id, batchId)),
			// Total sesi selalu = jumlah batch yang tidak dibatalkan
			db
				.update(tableSessions)
				.set({
					totalPrice: sql`(SELECT coalesce(sum(total_price), 0) FROM order_batches WHERE session_id = ${params.id} AND status != 'cancelled')`
				})
				.where(eq(tableSessions.id, params.id))
				.returning({ tableId: tableSessions.tableId })
		]);

		await pusherTrigger(
			platform.env,
			sessionChannels(params.id, updated?.tableId),
			'session-updated',
			{ sessionId: params.id }
		);
		return { success: true };
	}
};
