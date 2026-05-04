# Bugfix: Konten Kolom Kanan Terpotong di Mobile

## Gejala

Pada tampilan HP, kartu produk di kolom kanan (grid 2 kolom) terpotong di sisi kanan layar:

- Teks nama produk terpotong sebelum selesai
- Tombol keranjang (cart button) hanya terlihat setengah
- `overflow-x: hidden` pada body menyembunyikan overflow tanpa scroll, sehingga konten tampak terpotong begitu saja

Screenshot yang mereproduksi masalah: `image-input/Screenshot_20260429_225701.jpg`

## Penyebab

### Konflik antara Tailwind CSS v4 dan template.css

`(public)/+layout.svelte` mengimport dua file CSS:

```svelte
import '../../lib/styles/template.css'; import '../../lib/styles/admin.css';
```

`admin.css` mengandung `@import "tailwindcss"`, yang menyebabkan Tailwind v4 menambahkan `width: 100%` ke semua elemen yang menggunakan class `.container`.

**template.css (sebelum fix):**

```css
.container {
	max-width: 1120px;
	margin-inline: 1rem; /* margin di LUAR border box */
}
```

**Tailwind v4 (ditambahkan otomatis):**

```css
.container {
	width: 100%; /* lebar = 100% parent */
}
```

**Efek kombinasi keduanya pada mobile (misal viewport 360px):**

| Property            | Nilai                | Efek                          |
| ------------------- | -------------------- | ----------------------------- |
| `width: 100%`       | 360px                | Box selebar viewport          |
| `margin-left: 1rem` | 16px                 | Box didorong 16px ke kanan    |
| Box right edge      | 360 + 16 = **376px** | Meluap 16px melewati viewport |

Container meluap 16px ke kanan. Karena grid mengisi penuh container, kolom kanan juga meluap. `overflow-x: hidden` memotong tampilan di 360px, sehingga 16px sisi kanan kolom tidak terlihat — termasuk tombol cart yang diposisikan `right: .75rem`.

## Solusi

Ubah `.container` di `template.css` agar lebarnya eksplisit menggunakan `calc()`, sehingga Tailwind tidak bisa membuatnya lebih lebar dari yang diinginkan:

**template.css (sesudah fix):**

```css
/* Mobile default */
.container {
	max-width: 1120px;
	width: calc(100% - 2rem); /* selalu 1rem space di kiri dan kanan */
	margin-inline: auto; /* center */
}

/* Tablet (≥576px) */
@media screen and (min-width: 576px) {
	.container {
		width: calc(100% - 3rem); /* 1.5rem space di kiri dan kanan */
	}
}

/* Desktop (≥1150px) */
@media screen and (min-width: 1150px) {
	.container {
		width: 100%; /* max-width: 1120px yang membatasi, auto margin yang center */
	}
}
```

Dengan `width: calc(100% - 2rem)`, nilai `width: 100%` dari Tailwind di-override, dan container selalu memiliki ruang 1rem di kiri dan kanan — tidak peduli CSS framework apa yang aktif.

## File yang Diubah

- `src/lib/styles/template.css` — class `.container` dan media query terkait
