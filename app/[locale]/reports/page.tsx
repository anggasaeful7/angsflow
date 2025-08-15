import { requireUser } from '@/lib/auth/requireUser';
import { requireOrg } from '@/lib/auth/requireOrg';
import { getMonthlySeries, getCategoryBreakdown, getAdviceRecent } from '@/lib/analytics';
type Advice = { id: string; title: string };
import CashflowChart from '@/components/reports/CashflowChart';
import CategoryPie from '@/components/reports/CategoryPie';
import { getTranslations } from 'next-intl/server';

export default async function ReportsPage() {
  const t = await getTranslations();
  const user = await requireUser();
  const orgId = await requireOrg();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [series, categories, advices]: [
    Awaited<ReturnType<typeof getMonthlySeries>>,
    Awaited<ReturnType<typeof getCategoryBreakdown>>,
    Advice[],
  ] = await Promise.all([
    getMonthlySeries({ orgId }),
    getCategoryBreakdown({ orgId, month, year }),
    getAdviceRecent({ orgId, userId: user.id }),
  ]);
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-xl">{t('Reports')}</h1>
      <section className="space-y-2">
        <h2 className="font-semibold">{t('Cashflow (12 bulan)')}</h2>
        <CashflowChart data={series} />
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">{t('Kategori Pengeluaran (Bulan Ini)')}</h2>
        {categories.length > 0 ? <CategoryPie data={categories} /> : <p>{t('Tidak ada data')}</p>}
      </section>
      <section className="space-y-2">
        <h2 className="font-semibold">{t('Rekomendasi Terbaru')}</h2>
        <ul className="list-disc pl-4">
          {advices.map((a) => (
            <li key={a.id}>{a.title}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
