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
