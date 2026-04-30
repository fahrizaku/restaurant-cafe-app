# Restaurant Cafe App

Aplikasi kasir dan manajemen order untuk cafe/restoran kecil-menengah.
Dibangun dengan SvelteKit + Tailwind CSS v4 + Drizzle ORM + Cloudflare D1/Workers.

## Tujuan Produk

Ditargetkan untuk cafe dan UMKM kuliner di daerah (Trenggalek-Tulungagung, Jawa Timur) yang belum memiliki sistem digital. Dijual sebagai produk sampingan dengan harga terjangkau.

**Dua mode order:**
1. **QR Order** — customer scan QR di meja, pilih menu, order sendiri
2. **POS Kasir** — kasir input order manual di `/admin/pos` (belum diimplementasi)

## Status Fitur

### Selesai
- Manajemen menu (tambah, edit, hapus, kategori, gambar)
- Manajemen meja + QR code
- QR Order: customer scan → order → bill per meja
- Admin: daftar sesi, detail sesi, update status batch, mark paid, close session
- Dashboard admin: statistik ringkas

### Belum Diimplementasi
- **POS Kasir** (`/admin/pos`) — kasir input order manual
- Laporan harian/bulanan
- Print struk (integrasi thermal printer)
- Multi-user / role (owner vs kasir)

## Dev Mode

**Data dapat dihapus kapan saja** — ini masih tahap development, tidak ada data produksi.

## Arsitektur: Table Bill Model

Setiap kunjungan meja menghasilkan satu **sesi** (`table_sessions`). Dalam satu sesi, customer bisa order berkali-kali — setiap klik "Place Order" membuat satu **batch** (`order_batches`). Semua batch dalam satu sesi terakumulasi menjadi satu tagihan.

```
tables
  └── table_sessions (satu per kunjungan, status: open/closed)
        └── order_batches (satu per "Place Order", status: pending/processing/done/cancelled)
              └── order_items (item dalam batch)
```

**Lifecycle sesi:**
1. Customer scan QR → buka `/menu?table=T-01`
2. Customer place order → sesi dibuat otomatis (jika belum ada) + batch baru dibuat → redirect ke `/table/T-01`
3. Customer bisa order lagi → batch baru masuk ke sesi yang sama
4. Kasir update status batch di admin: `pending → processing → done`
5. Kasir cancel batch → total sesi dikurangi otomatis
6. Kasir mark paid (cash/QRIS/transfer) → `payment_status: paid`
7. Kasir close session → `status: closed`, sesi tidak bisa menerima order baru
8. Scan QR berikutnya → sesi baru dibuat otomatis

**Catatan perilaku:**
- Sesi yang sudah `paid` tapi belum `closed` masih bisa menerima order baru (batch baru masuk, payment status tetap paid — ini perlu diperbaiki, idealnya reset ke unpaid)

## Halaman Publik

- `/` — landing page restoran (info saja, tidak bisa order)
- `/menu?table=T-01` — menu + order (wajib ada param `table`)
- `/menu` (tanpa param) — tampilkan instruksi scan QR
- `/table/T-01` — status bill meja, auto-refresh setiap 10 detik

## Admin

- `/admin` — dashboard statistik
- `/admin/orders` — daftar sesi (bukan individual order)
- `/admin/orders/[sessionId]` — detail sesi: semua batch, update status, payment, close session
- `/admin/menus` — manajemen menu
- `/admin/categories` — manajemen kategori
- `/admin/tables` — manajemen meja + QR
- `/admin/pos` — POS kasir (belum ada)

## Menjalankan Lokal

```bash
npm install
npx wrangler dev
```

## Migrasi Database

Apply ke lokal:
```bash
npx wrangler d1 migrations apply restaurant-db --local
```

Apply ke production:
```bash
npx wrangler d1 migrations apply restaurant-db --remote
```

## Tech Stack

- **Frontend**: SvelteKit (Svelte 5), Tailwind CSS v4
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite), Drizzle ORM
- **Deployment**: Cloudflare Pages/Workers

## CSS

- `src/lib/styles/template.css` — template UI publik (custom CSS)
- `src/lib/styles/admin.css` — admin UI (Tailwind CSS v4)

**Catatan:** Tailwind v4 menambahkan `width: 100%` ke class `.container`. Untuk mencegah konflik dengan `margin-inline` dari template.css, gunakan `width: calc(100% - 2rem)` + `margin-inline: auto` — bukan `margin-inline: 1rem`.
