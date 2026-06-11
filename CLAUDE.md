# Restaurant Cafe App

> **Untuk Claude:** Perbarui file ini setiap kali ada perubahan pada arsitektur, lifecycle, daftar halaman, status fitur, atau catatan CSS/icon.

Aplikasi kasir + manajemen order untuk cafe/UMKM. SvelteKit + Tailwind CSS v4 + Drizzle ORM + Cloudflare D1/Workers.

## Tech Stack

- Frontend: SvelteKit (Svelte 5), Tailwind CSS v4
- Backend: Cloudflare Workers, Cloudflare D1 (SQLite), Drizzle ORM

## Menjalankan Lokal

```bash
npm install && npx wrangler dev
npx wrangler d1 migrations apply restaurant-db --local
```

## Arsitektur

```
tables
  └── table_sessions  (status: open / processing / closed / cancelled)
        └── order_batches  (status: pending / processing / done / cancelled)
              └── order_items
```

Satu kunjungan meja = satu sesi. Satu klik "Place Order" = satu batch. Semua batch terakumulasi jadi satu tagihan. Invariant: `total_price` sesi = jumlah `total_price` batch yang tidak `cancelled` (dihitung ulang via subquery saat status batch berubah / reopen).

**Lifecycle:** scan QR → sesi dibuat otomatis → customer order → batch baru → kasir update status batch (pending → processing → done, bisa cancel/pulihkan per batch) → mark paid (sesi jadi `processing`) → complete (hanya jika sudah paid) → close session. Reopen sesi `cancelled` memulihkan batch-nya jadi `pending`; reopen ditolak jika meja sudah punya sesi open lain.

Semua jalur order (menu publik, cart, POS kasir) lewat `processOrder()` di `src/lib/server/order.ts` — harga server-side, validasi quantity/tableId, atomic `db.batch`, dukungan `notes`. POS memanggil dengan `cookies = null` (takeaway selalu sesi baru). Partial unique index: satu sesi `open` per meja. `/admin/orders` paginated 20/halaman. Cart publik persist ke `localStorage` (key `cafe-cart`).

Konteks meja customer diingat di cookie `table_id` (6 jam) via `src/lib/server/table-context.ts` — URL `?table=` menang atas cookie; di-set oleh load `/menu`, `/cart`, `/table/[id]`. Tanpa ini, tab "Tagihan" hilang saat berpindah halaman tanpa query param.

### Pembayaran Customer

Customer bisa memilih cara bayar di halaman tagihan (`/table/[id]` & `/order/status/[id]`): **bayar ke kasir** (instruksi statis) atau **transfer di meja**. `paymentStatus`: `unpaid` → `pending` (customer upload bukti transfer, klaim sudah bayar) → `paid` (kasir verifikasi manual). Logika di `src/lib/server/payment.ts` (`requestTransfer()`): validasi file (jpeg/png/webp, maks 5 MB), simpan ke R2 `payment-proofs/{sessionId}/{ts}`, kolom `payment_proof` di sesi. Bukti disajikan ke kasir via `GET /admin/payment-proof/[...key]` (stream dari R2, di balik Basic Auth). Kasir konfirmasi (markPaid transfer) atau tolak (`rejectTransfer` → `unpaid`, hapus bukti). Order baru saat `pending` → reset ke `unpaid` + hapus klaim. Info rekening dari tabel `settings` (`bank_name`, `bank_account`, `bank_holder`) via `getBankInfo()` di `src/lib/server/settings.ts`; jika kosong, opsi transfer disembunyikan. Nilai enum `pending` hanya level TypeScript (kolom text tanpa CHECK).

### Realtime (Pusher)

Notifikasi realtime via Pusher Channels (opsional — tanpa env, app fallback ke polling 10 detik).

- Server: `src/lib/server/pusher.ts` — REST API langsung (Web Crypto, tanpa SDK Node). `pusherTrigger()` no-op jika env kosong.
- Client: `src/lib/realtime.ts` (`pusher-js`), config dikirim lewat `load` (`pusherClientConfig()`). Subscription di-ref-count per channel — beberapa komponen boleh subscribe channel sama (Header + halaman); jangan panggil `client.unsubscribe` langsung.
- Notifikasi admin terpusat di `Header.svelte` (lonceng + suara via `src/lib/notification-sound.ts` — AudioContext di-unlock pada interaksi pertama karena autoplay policy). Halaman admin hanya `invalidateAll()` + fallback polling 10 detik jika Pusher tidak dikonfigurasi.
- Channel: `admin-orders` (semua event, notif + suara di `/admin/orders`), `session-{id}` (status pesanan customer & detail admin), `table-{id}` (bill meja).
- Event: `new-batch` (order baru dari menu/cart/POS), `session-updated` (aksi kasir: mark paid / complete / cancel / reopen / batch status / tolak transfer), `payment-requested` (customer klaim sudah transfer — bunyi di `/admin/orders`).
- Env (secret): `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`. Lokal: `.dev.vars` (lihat `.dev.vars.example`); produksi: `npx wrangler pages secret put`.

## Halaman

**Publik:** `/` landing · `/menu?table=T-01` order · `/table/T-01` status bill

**Admin:** `/admin` dashboard · `/admin/orders` daftar sesi · `/admin/orders/[id]` detail · `/admin/menus` · `/admin/categories` · `/admin/tables` · `/admin/pos` POS kasir · `/admin/settings` pengaturan (rekening transfer)

## Status Fitur

Selesai: manajemen menu/kategori/meja, QR order, admin orders, dashboard, POS kasir.

Belum: laporan harian/bulanan, print struk, multi-user/role.

## Sebelum Commit

Selalu jalankan type-check sebelum commit:

```bash
npm run check
```

Pastikan tidak ada error sebelum melanjutkan commit.

Jangan tambahkan tanda tangan `Co-Authored-By: Claude` pada pesan commit.

## CSS

Admin pakai `src/lib/styles/admin.css` (Tailwind v4). Tailwind v4 menambah `width: 100%` ke `.container` — gunakan `width: calc(100% - 2rem)` + `margin-inline: auto` untuk menghindari konflik dengan template.css publik.

Icon admin: `lucide-svelte` (tree-shakeable, bundled). Remix Icon CDN hanya di public layout — jangan pakai `ri-*` di admin.
