# AngsFlow – AI Financial Coach

Scaffold aplikasi menggunakan Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, dan Auth.js.

## Menjalankan Lokal

```bash
pnpm i
pnpm prisma:migrate
pnpm seed
pnpm dev
```

Login demo: `admin@demo.local` / `admin123`.

User tambahan untuk uji undangan: `member@demo.local` / `member123`.
Setelah login sebagai member, kunjungi `/invite/demo-token` untuk menerima undangan ke Demo Org.

## Import CSV

File CSV harus memiliki kolom `Date`, `Description`, dan `Amount`. Nilai `Amount` negatif akan diimport sebagai pengeluaran, positif sebagai pemasukan. Tanggal boleh dalam format `YYYY-MM-DD` atau `DD/MM/YYYY`.

Contoh:

```
Date,Description,Amount
2025-08-01,GOJEK-FOOD,-45000
2025-08-01,Gaji Agustus,15000000
```

Gunakan fitur Rule dengan properti `contains` untuk mengkategorikan transaksi otomatis pada import berikutnya.

## Budgets & Goals

Halaman `/budgets` memungkinkan penambahan anggaran per kategori untuk bulan berjalan. Progress dihitung dari total pengeluaran dibanding batas anggaran:

- <80%: aman
- 80–100%: peringatan
- > 100%: melewati anggaran

Halaman `/goals` digunakan untuk membuat target tabungan organisasi. Setiap goal memiliki nama, jumlah target, dan progres tersimpan. Fitur proyeksi `projectGoal` menghitung estimasi waktu tercapai berdasarkan tabungan bulanan.

Contoh: _Nabung 1.000.000/bulan untuk Dana Darurat 10.000.000 → 10 bulan_.

Dashboard menampilkan ringkasan pemasukan/pengeluaran, burn rate, overview anggaran, pengeluaran terbesar, dan progress goal.

## AI Coach

Halaman `/coach` memungkinkan percakapan dengan AI Financial Coach berbasis OpenAI.

### Konfigurasi

Tambahkan `OPENAI_API_KEY` pada `.env`. Zona waktu dan locale default sudah disediakan melalui `NEXT_PUBLIC_DEFAULT_TZ` dan `NEXT_PUBLIC_DEFAULT_LOCALE`.

### Privasi

AI tidak memiliki akses langsung ke basis data. Seluruh data diambil melalui _tools_ yang secara ketat menscope `orgId` dan `userId`.

### Contoh Prompt

- Analisis pengeluaran bulan ini & beri 3 langkah penghematan.
- Sarankan budget bulan depan berdasarkan 3 bulan terakhir.
- Jika saya menabung Rp1.000.000/bulan untuk Dana Darurat 10 juta, kapan tercapai?
- Kategori apa yang paling membengkak bulan ini?

> **Catatan:** Fitur ini bukan nasihat keuangan profesional.

## Reports & Hardening

Halaman `/reports` menampilkan grafik arus kas 12 bulan terakhir dan pie pengeluaran per kategori bulan berjalan. Data diolah melalui helper pada `lib/analytics.ts` yang menscope `orgId` dan menggunakan zona waktu `Asia/Jakarta`.

Autentikasi dan aksi chat dilindungi oleh util rate limit (`lib/rateLimit.ts`) dengan batas default 10 permintaan/10 menit untuk login dan 1 pesan/2 detik untuk coach. Middleware tenant memastikan semua operasi basis data terscope ke organisasi aktif.

## Internationalization

AngsFlow menggunakan [next-intl](https://next-intl-docs.vercel.app/) untuk menerjemahkan UI.
Saat ini mendukung locale **id** dan **en**.
Preferensi bahasa disimpan di `localStorage` melalui tombol toggle di navbar.

### Menambah Locale Baru

1. Tambah file `messages/<locale>.json` berisi terjemahan.
2. Masukkan kode locale baru pada `locales` di `i18n.ts`.
3. Sediakan toggle/opsi pilihan bahasa jika diperlukan.

Jika suatu kunci terjemahan tidak ditemukan, aplikasi akan menggunakan nilai dari locale default.
