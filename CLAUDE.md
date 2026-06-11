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

**Kebijakan bayar-dulu (pay-first):** satu order = satu sesi = satu tagihan. `processOrder()` selalu membuat sesi baru dan **menolak** order jika masih ada sesi `open` (= belum dibayar) untuk meja/cookie tsb. Batch tetap ada di skema (satu batch per sesi untuk order baru; data lama bisa multi-batch). Invariant: `total_price` sesi = jumlah `total_price` batch yang tidak `cancelled`.

**Lifecycle:** scan QR → customer order → sesi baru (`open`, `unpaid`) → customer bayar (kasir mark paid / verifikasi transfer) → sesi jadi `processing` → dapur proses batch (server menolak ubah batch ke processing/done selama `unpaid`) → complete → close. Karena partial unique index hanya membatasi sesi `open`, setelah dibayar meja langsung bebas dipesan lagi — sesi `processing` lama dan `open` baru bisa berjalan paralel; `/table/[id]` menampilkan semua sesi open+processing sekaligus. Reopen sesi `cancelled` memulihkan batch-nya jadi `pending`; reopen ditolak jika meja sudah punya sesi open lain.

Semua jalur order (menu publik, cart, POS kasir) lewat `processOrder()` di `src/lib/server/order.ts` — harga server-side, validasi quantity/tableId, atomic `db.batch`, dukungan `notes`. POS memanggil dengan `cookies = null` (takeaway selalu sesi baru). Partial unique index: satu sesi `open` per meja. `/admin/orders` paginated 20/halaman. Cart publik persist ke `localStorage` (key `cafe-cart`), termasuk catatan per item (input di halaman cart, maks 200 karakter, tampil di halaman bill/status customer). Setelah order sukses, redirect membawa `?ordered=1` → halaman tujuan (`/table/[id]`, `/order/status/[id]`) menampilkan toast "Pesanan terkirim! Selesaikan pembayaran…" lalu membersihkan URL via `replaceState`. Saat ada tagihan `unpaid`, halaman cart menyembunyikan form order dan menampilkan CTA "Bayar Tagihan Sekarang" (keranjang tetap tersimpan); banner di `/menu` juga mengajak bayar.

Konteks meja customer diingat di cookie `table_id` (6 jam) via `src/lib/server/table-context.ts` — URL `?table=` menang atas cookie; di-set oleh load `/menu`, `/cart`, `/table/[id]`. Tanpa ini, tab "Tagihan" hilang saat berpindah halaman tanpa query param.

### Pembayaran Customer

Customer bisa memilih cara bayar di halaman tagihan (`/table/[id]` & `/order/status/[id]`): **bayar ke kasir** (instruksi statis) atau **transfer di meja**. `paymentStatus`: `unpaid` → `pending` (customer upload bukti transfer, klaim sudah bayar) → `paid` (kasir verifikasi manual). Logika di `src/lib/server/payment.ts` (`requestTransfer()`): validasi file (jpeg/png/webp, maks 5 MB), simpan ke R2 `payment-proofs/{sessionId}/{ts}`, kolom `payment_proof` di sesi. Bukti disajikan ke kasir via `GET /admin/payment-proof/[...key]` (stream dari R2, di balik auth admin). Kasir konfirmasi (markPaid transfer) atau tolak (`rejectTransfer` → `unpaid`, hapus bukti). Order baru saat `pending` → reset ke `unpaid` + hapus klaim. Info rekening dari tabel `settings` (`bank_name`, `bank_account`, `bank_holder`) via `getBankInfo()` di `src/lib/server/settings.ts`; jika kosong, opsi transfer disembunyikan. Nilai enum `pending` hanya level TypeScript (kolom text tanpa CHECK).

### Realtime (Pusher)

Notifikasi realtime via Pusher Channels (opsional — tanpa env, app fallback ke polling 10 detik).

- Server: `src/lib/server/pusher.ts` — REST API langsung (Web Crypto, tanpa SDK Node). `pusherTrigger()` no-op jika env kosong.
- Client: `src/lib/realtime.ts` (`pusher-js`), config dikirim lewat `load` (`pusherClientConfig()`). Subscription di-ref-count per channel — beberapa komponen boleh subscribe channel sama (Header + halaman); jangan panggil `client.unsubscribe` langsung.
- Notifikasi admin terpusat di `Header.svelte` (lonceng + suara via `src/lib/notification-sound.ts` — AudioContext di-unlock pada interaksi pertama karena autoplay policy). Halaman admin hanya `invalidateAll()` + fallback polling 10 detik jika Pusher tidak dikonfigurasi.
- Channel: `admin-orders` (semua event, notif + suara di `/admin/orders`), `session-{id}` (status pesanan customer & detail admin), `table-{id}` (bill meja).
- Event: `new-batch` (order baru dari menu/cart/POS), `session-updated` (aksi kasir: mark paid / complete / cancel / reopen / batch status / tolak transfer), `payment-requested` (customer klaim sudah transfer — bunyi di `/admin/orders`).
- Env (secret): `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`. Lokal: `.dev.vars` (lihat `.dev.vars.example`); produksi: `npx wrangler pages secret put`.
- Event `order-confirmed` (kasir ubah batch ke `processing`) membawa `estimatedMinutes` opsional (input kasir di detail order, validasi 1–999) — toast customer menampilkan "Siap dalam ±X menit."
- `session-updated` dari aksi ubah status batch membawa `batchStatus` — halaman customer (`/table/[id]`, `/order/status/[id]`) toast "Pesanan Anda siap!" (done) / "Satu pesanan dibatalkan." (cancelled). Semua toast customer disertai suara (`notification-sound.ts`, dipakai bersama admin) + `navigator.vibrate`.

### Auth Admin (Multi-user/Role)

Login cookie session di `/admin/login`, menggantikan Basic Auth. Logika di `src/lib/server/auth.ts` + `src/hooks.server.ts`.

- Tabel `users` (role: `owner` / `cashier`) + `auth_sessions` (id = SHA-256 token cookie `admin_session`, exp 7 hari).
- Password: PBKDF2-SHA256 100k iterasi (Web Crypto), format `pbkdf2$iter$salt$hash`.
- Hooks: semua `/admin/*` (kecuali `/admin/login`) wajib sesi valid → redirect login dengan `?redirectTo=`; `locals.user` diisi. Kasir diblokir dari `/admin/reports`, `/admin/settings`, `/admin/users` (daftar `OWNER_ONLY_PREFIXES`).
- Setup pertama kali: jika tabel `users` kosong, `/admin/login` menampilkan form buat akun owner.
- `/admin/users` (owner only): tambah akun, reset password (hapus semua sesi user), hapus akun (tidak bisa hapus diri sendiri / owner terakhir).
- Logout: POST `/admin/logout`. Sidebar menyaring menu per role; Header tampilkan nama + role.
- `+page@.svelte` dipakai `/admin/login` (bypass layout admin, seperti halaman print).

## Halaman

**Publik:** `/` landing · `/menu?table=T-01` order · `/table/T-01` status bill · `/bill` resolver tagihan (redirect via cookie meja/sesi, atau empty state)

**Admin:** `/admin/login` login/setup owner · `/admin` dashboard · `/admin/orders` daftar sesi · `/admin/orders/[id]` detail · `/admin/orders/[id]/print` struk thermal 80mm (auto-print, layout root via `+page@.svelte`) · `/admin/menus` · `/admin/categories` · `/admin/tables` · `/admin/pos` POS kasir · `/admin/settings` pengaturan (nama cafe + rekening transfer) · `/admin/reports` laporan harian (pendapatan per hari + item terlaris, filter 7/30/90 hari) · `/admin/users` kelola akun staf (owner only)

## Status Fitur

Selesai: manajemen menu/kategori/meja, QR order, admin orders, dashboard, POS kasir, laporan harian, print struk, estimasi waktu order, multi-user/role.

Belum: laporan bulanan.

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
