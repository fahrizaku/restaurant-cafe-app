import { settings } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import type { getDb } from '$lib/server/db';

type Db = ReturnType<typeof getDb>;

export interface BankInfo {
	bankName: string;
	bankAccount: string;
	bankHolder: string;
}

const BANK_KEYS = ['bank_name', 'bank_account', 'bank_holder'] as const;

/** Info rekening untuk pembayaran transfer; null jika belum lengkap diisi di settings. */
export async function getBankInfo(db: Db): Promise<BankInfo | null> {
	const rows = await db
		.select()
		.from(settings)
		.where(inArray(settings.key, [...BANK_KEYS]));
	const map = new Map(rows.map((r) => [r.key, r.value]));

	const bankName = map.get('bank_name')?.trim();
	const bankAccount = map.get('bank_account')?.trim();
	if (!bankName || !bankAccount) return null;

	return { bankName, bankAccount, bankHolder: map.get('bank_holder')?.trim() ?? '' };
}

/** Nama cafe dari settings; fallback 'Cafe' jika belum diisi. */
export async function getCafeName(db: Db): Promise<string> {
	const rows = await db.select().from(settings).where(inArray(settings.key, ['cafe_name']));
	return rows[0]?.value?.trim() || 'Cafe';
}

export async function setSetting(db: Db, key: string, value: string) {
	await db
		.insert(settings)
		.values({ key, value })
		.onConflictDoUpdate({ target: settings.key, set: { value } });
}
