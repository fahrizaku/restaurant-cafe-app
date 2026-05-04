# Restaurant Cafe App

> **Untuk Gemini:** Perbarui file ini setiap kali ada perubahan pada arsitektur, lifecycle, daftar halaman, status fitur, atau catatan CSS/icon.

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
tables (opsional)
  └── table_sessions  (customerName / tableId, status: open / processing / closed / cancelled)
        └── order_batches  (status: pending / processing / done / cancelled)
              └── order_items
```

Satu kunjungan = satu sesi. Identitas sesi bisa berupa nomor meja (dari QR) atau nama pelanggan (input manual).

**Lifecycle:** scan QR / buka link menu → isi nama (jika tidak ada nomor meja) → sesi dibuat → customer order → batch baru → kasir update status → mark paid → close session.

## Halaman

**Publik:** `/` landing · `/menu?table=T-01` order · `/table/T-01` status bill (meja) · `/order/status/[sessionId]` status bill (umum)

**Admin:** `/admin` dashboard · `/admin/orders` daftar sesi · `/admin/orders/[id]` detail · `/admin/menus` · `/admin/categories` · `/admin/tables` · `/admin/pos` POS kasir

## Status Fitur

Selesai: manajemen menu/kategori/meja, QR order, fleksibel identitas (Nama/Meja), admin orders, dashboard, POS kasir.

Belum: laporan harian/bulanan, print struk, multi-user/role.

## CSS

Admin pakai `src/lib/styles/admin.css` (Tailwind v4). Tailwind v4 menambah `width: 100%` ke `.container` — gunakan `width: calc(100% - 2rem)` + `margin-inline: auto` untuk menghindari konflik dengan template.css publik.

Icon admin: `lucide-svelte` (tree-shakeable, bundled). Remix Icon CDN hanya di public layout — jangan pakai `ri-*` di admin.
