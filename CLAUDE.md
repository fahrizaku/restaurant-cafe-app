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

Satu kunjungan meja = satu sesi. Satu klik "Place Order" = satu batch. Semua batch terakumulasi jadi satu tagihan.

**Lifecycle:** scan QR → sesi dibuat otomatis → customer order → batch baru → kasir update status → mark paid → close session.

## Halaman

**Publik:** `/` landing · `/menu?table=T-01` order · `/table/T-01` status bill

**Admin:** `/admin` dashboard · `/admin/orders` daftar sesi · `/admin/orders/[id]` detail · `/admin/menus` · `/admin/categories` · `/admin/tables` · `/admin/pos` POS kasir

## Status Fitur

Selesai: manajemen menu/kategori/meja, QR order, admin orders, dashboard, POS kasir.

Belum: laporan harian/bulanan, print struk, multi-user/role.

## CSS

Admin pakai `src/lib/styles/admin.css` (Tailwind v4). Tailwind v4 menambah `width: 100%` ke `.container` — gunakan `width: calc(100% - 2rem)` + `margin-inline: auto` untuk menghindari konflik dengan template.css publik.

Icon admin: `lucide-svelte` (tree-shakeable, bundled). Remix Icon CDN hanya di public layout — jangan pakai `ri-*` di admin.
