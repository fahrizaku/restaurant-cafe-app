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

### Realtime (Pusher)

Notifikasi realtime via Pusher Channels (opsional — tanpa env, app fallback ke polling 10 detik).

- Server: `src/lib/server/pusher.ts` — REST API langsung (Web Crypto, tanpa SDK Node). `pusherTrigger()` no-op jika env kosong.
- Client: `src/lib/realtime.ts` (`pusher-js`), config dikirim lewat `load` (`pusherClientConfig()`).
- Channel: `admin-orders` (semua event, notif + suara di `/admin/orders`), `session-{id}` (status pesanan customer & detail admin), `table-{id}` (bill meja).
- Event: `new-batch` (order baru dari menu/cart/POS), `session-updated` (aksi kasir: mark paid / complete / cancel / reopen).
- Env (secret): `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`. Lokal: `.dev.vars` (lihat `.dev.vars.example`); produksi: `npx wrangler pages secret put`.

## Halaman

**Publik:** `/` landing · `/menu?table=T-01` order · `/table/T-01` status bill

**Admin:** `/admin` dashboard · `/admin/orders` daftar sesi · `/admin/orders/[id]` detail · `/admin/menus` · `/admin/categories` · `/admin/tables` · `/admin/pos` POS kasir

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
