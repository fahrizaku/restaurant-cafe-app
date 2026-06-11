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

- [x] **Race condition pembuatan sesi** — partial unique index `table_sessions_open_per_table` pada `(table_id) WHERE status = 'open'`. Insert kedua yang konflik di-retry dengan re-query sesi yang sudah ada.
  - File: `src/lib/server/db/schema.ts`, `drizzle/0001_open_session_per_table.sql`, `src/lib/server/order.ts`

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

---

# Review Kedua: Kesiapan Produksi (Cafe Ramai, ±50 Customer)

## Kritis

- [x] **POS belum pakai `processOrder()`** — kini pakai `processOrder()` mode tanpa cookie (takeaway selalu sesi baru); harga server-side, atomic, dukungan `notes`.
  - File: `src/routes/admin/pos/+page.server.ts`, `src/lib/server/order.ts`

- [x] **`reopenSession` bisa 500 & tagihan tidak konsisten** — guard jika meja sudah punya sesi open lain (error ramah); reopen dari `cancelled` memulihkan batch `cancelled` → `pending`; total dihitung ulang dari batch non-cancelled.
  - File: `src/routes/admin/orders/[id]/+page.server.ts`

## Operasional

- [x] **Workflow status batch** — action `updateBatchStatus` + tombol per batch (Proses / Selesai / Batalkan / Pulihkan). Cancel/restore batch menghitung ulang total sesi secara atomic.
  - File: `src/routes/admin/orders/[id]/+page.server.ts`, `src/routes/admin/orders/[id]/+page.svelte`

- [x] **Pagination `/admin/orders`** — 20 sesi per halaman (terbaru dulu) + count total; tab status tetap. Sesi aktif selalu di atas karena urut terbaru.
  - File: `src/routes/admin/orders/+page.server.ts`, `src/routes/admin/orders/+page.svelte`

- [x] **Statistik dashboard salah** — semua stat kini pakai query `count(*)` sebenarnya.
  - File: `src/routes/admin/+page.server.ts`

## Minor

- [x] **Cart persist ke `localStorage`** — keranjang bertahan saat refresh; data divalidasi saat dimuat.
  - File: `src/lib/stores/cart.svelte.ts`

- [x] **Error menu tidak tersedia sebutkan namanya** — plus pesan error kini ditampilkan di halaman cart, POS, dan admin (sebelumnya tidak terlihat).
  - File: `src/lib/server/order.ts`, `src/routes/(public)/cart/+page.svelte`, `src/routes/admin/pos/+page.svelte`, `src/routes/admin/orders/+page.svelte`, `src/routes/admin/orders/[id]/+page.svelte`

- [x] **`completeSession` tolak sesi `unpaid`** — guard di kedua route; POS juga tidak lagi mengosongkan keranjang saat order gagal.
  - File: `src/routes/admin/orders/+page.server.ts`, `src/routes/admin/orders/[id]/+page.server.ts`

## Catatan

- Channel Pusher masih publik; pertimbangkan private channel jika payload event diperkaya di masa depan.
- Semua item (review pertama & kedua) selesai dikerjakan.
