Bangun aplikasi AngsFlow – AI Financial Coach.
Stack: Next.js 14 App Router + TypeScript, Tailwind, Prisma + PostgreSQL, Auth.js (credential/email), Zod, react-hook-form, next-intl (i18n ID/EN), date-fns-tz.
Default: locale id, currency IDR, timezone Asia/Jakarta.
Multi-tenant: Organization, Membership; semua data terikat ke org (orgId).
Fitur v1: Auth, manajemen organisasi, impor CSV transaksi (auto-kategori via rules), budget & goals, dashboard ringkasan, AI Coach (tools terkontrol), laporan grafik, hardening dasar.

## Contributing

1. Pastikan Node.js 20 terpasang.
2. Instal dependencies:

   ```bash
   npm install
   ```

3. Jalankan pemeriksaan sebelum commit:

   ```bash
   npm run lint
   npm run typecheck
   npm run build
   ```

4. Husky akan menjalankan format dan lint secara otomatis pada commit.
