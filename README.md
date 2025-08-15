Bangun aplikasi AngsFlow – AI Financial Coach.
Stack: Next.js 14 App Router + TypeScript, Tailwind, Prisma + PostgreSQL, Auth.js (credential/email), Zod, react-hook-form, next-intl (i18n ID/EN), date-fns-tz.
Default: locale id, currency IDR, timezone Asia/Jakarta.
Multi-tenant: Organization, Membership; semua data terikat ke org (orgId).
Fitur v1: Auth, manajemen organisasi, impor CSV transaksi (auto-kategori via rules), budget & goals, dashboard ringkasan, AI Coach (tools terkontrol), laporan grafik, hardening dasar.
