import { getDb } from '$lib/server/db';
import { pusherClientConfig } from '$lib/server/pusher';
import { tableSessions } from '$lib/server/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { rememberTable } from '$lib/server/table-context';
import { getBankInfo } from '$lib/server/settings';
import { requestTransfer } from '$lib/server/payment';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
	if (!platform?.env.DB) error(500, 'Service unavailable');

	const db = getDb(platform.env.DB);

	const table = await db.query.tables.findFirst({
		where: (t, { eq }) => eq(t.id, params.id)
	});

	if (!table) error(404, 'Table not found');

	// Ingat meja agar konteks tidak hilang saat kembali ke /menu lewat navbar
	rememberTable(cookies, table.id);

	// Bayar-dulu: bisa ada beberapa sesi aktif sekaligus untuk satu meja —
	// satu `open` (tagihan baru, belum dibayar) + beberapa `processing` (sudah
	// dibayar, sedang disiapkan). Tampilkan semuanya, terbaru di atas.
	const [sessions, bank] = await Promise.all([
		db.query.tableSessions.findMany({
			where: and(
				eq(tableSessions.tableId, params.id),
				or(eq(tableSessions.status, 'open'), eq(tableSessions.status, 'processing'))
			),
			orderBy: [desc(tableSessions.openedAt)],
			with: {
				batches: {
					orderBy: (b, { desc }) => [desc(b.createdAt)],
					with: {
						items: {
							with: { menu: true }
						}
					}
				}
			}
		}),
		getBankInfo(db)
	]);

	return { table, sessions, bank, pusher: pusherClientConfig(platform.env) };
};

export const actions: Actions = {
	requestTransfer: async ({ request, params, platform }) => {
		if (!platform?.env.DB) return fail(500, { message: 'Service unavailable' });

		const db = getDb(platform.env.DB);
		// Sesi diambil dari meja, bukan dari input client.
		// Klaim transfer hanya untuk tagihan yang belum dibayar (sesi `open`).
		const session = await db.query.tableSessions.findFirst({
			where: and(eq(tableSessions.tableId, params.id), eq(tableSessions.status, 'open'))
		});
		if (!session) return fail(404, { message: 'Tidak ada tagihan yang menunggu pembayaran' });

		const data = await request.formData();
		return requestTransfer(platform, session.id, data.get('proof'));
	}
};
