# Restaurant Cafe App

SvelteKit + Tailwind CSS v4 + Drizzle ORM + Cloudflare D1/Workers.

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

**Halaman publik:**
- `/` — landing page restoran (info saja, tidak bisa order)
- `/menu?table=T-01` — menu + order (wajib ada param `table`)
- `/menu` (tanpa param) — tampilkan instruksi scan QR
- `/table/T-01` — status bill meja, auto-refresh setiap 10 detik

**Admin:**
- `/admin/orders` — daftar sesi (bukan individual order)
- `/admin/orders/[sessionId]` — detail sesi: semua batch, update status, payment, close session

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

## CSS

- `src/lib/styles/template.css` — template UI publik (custom CSS)
- `src/lib/styles/admin.css` — admin UI (Tailwind CSS v4)

**Catatan:** Tailwind v4 menambahkan `width: 100%` ke class `.container`. Untuk mencegah konflik dengan `margin-inline` dari template.css, gunakan `width: calc(100% - 2rem)` + `margin-inline: auto` — bukan `margin-inline: 1rem`.
