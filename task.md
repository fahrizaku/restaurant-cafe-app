# Perbaikan Mekanisme Order

## Keamanan (Prioritas Tinggi)

- [x] **Harga server-side** — server ambil harga dari DB (`menus.price`), validasi `isAvailable` dan keberadaan `menuId`.
  - File: `src/lib/server/order.ts` (shared function baru)

- [x] **Validasi quantity** — tolak quantity ≤ 0, bukan integer, atau > 99.
  - File: `src/lib/server/order.ts`

- [x] **Autentikasi admin** — Basic Auth via `src/hooks.server.ts` untuk semua route `/admin/*`.
  - Aktifkan dengan env var `ADMIN_PASSWORD` di `.dev.vars` / `wrangler pages secret put`.
  - Jika env tidak diset, admin terbuka (mode dev).

## Konsistensi Data (Prioritas Tinggi)

- [x] **Atomic database operations** — insert batch + items + update total digabung ke `db.batch([...])` D1.
  - File: `src/lib/server/order.ts`

- [x] **Race condition total sesi** — ganti read-modify-write menjadi `sql\`total_price + ?\``.
  - File: `src/lib/server/order.ts`

- [ ] **Race condition pembuatan sesi** — tambah unique constraint "satu sesi open per meja" di skema.
  - File: `src/lib/server/db/schema.ts` + migrasi baru
  - *Catatan: perlu migrasi DB, belum dikerjakan.*

## Konsistensi Logika

- [x] **Cancel sesi membatalkan batch** — saat sesi dibatalkan, set batch `pending`/`processing` ke `cancelled`.
  - File: `src/routes/admin/orders/+page.server.ts`, `src/routes/admin/orders/[id]/+page.server.ts`

- [x] **`reopenSession` tidak menghapus catatan pembayaran** — hanya reset `status` dan `closedAt`, bukan `paymentStatus`/`paymentMethod`.
  - File: `src/routes/admin/orders/[id]/+page.server.ts`

## Refactor & Kualitas Kode

- [x] **Hapus duplikasi action `order`** — logika order diekstrak ke `src/lib/server/order.ts`.
  - Kedua route (`menu` dan `cart`) kini memanggil `processOrder()` yang sama.

- [x] **Validasi `tableId`** — verifikasi meja ada di DB sebelum membuat sesi; kembalikan error ramah jika tidak ada.
  - File: `src/lib/server/order.ts`

## Catatan Sisa

- Race condition pembuatan sesi (dua request bersamaan ke meja tanpa sesi aktif) masih ada.
  Solusinya butuh unique partial index di skema D1 + migrasi.
- Channel Pusher masih publik; pertimbangkan private channel jika payload event diperkaya.
