import UploadCSV from '@/components/transactions/UploadCSV';
import TransactionsTable from '@/components/transactions/TransactionsTable';
import { requireUser } from '@/lib/auth/requireUser';
import { requireOrg } from '@/lib/auth/requireOrg';
import { listTransactions } from '@/app/transactions/actions';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { q?: string; categoryId?: string; sort?: string; page?: string };
}) {
  const t = await getTranslations();
  await requireUser();
  const orgId = await requireOrg();
  const page = parseInt(searchParams.page || '1', 10);
  const { txs, total } = await listTransactions({
    orgId,
    q: searchParams.q,
    categoryId: searchParams.categoryId,
    sort: searchParams.sort,
    page,
    pageSize: 20,
  });
  const categories = (await prisma.category.findMany({ where: { orgId } })) as {
    id: string;
    name: string;
    kind: string;
  }[];
  const totalPages = Math.ceil(total / 20);
  return (
    <div>
      <UploadCSV />
      <form method="get" className="mb-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q || ''}
          placeholder={t('Search')}
          className="border p-1"
        />
        <select
          name="categoryId"
          defaultValue={searchParams.categoryId || ''}
          className="border p-1"
        >
          <option value="">{t('All Categories')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={searchParams.sort || 'dateDesc'} className="border p-1">
          <option value="dateDesc">{t('Date')} ↓</option>
          <option value="dateAsc">{t('Date')} ↑</option>
          <option value="amountDesc">{t('Amount')} ↓</option>
          <option value="amountAsc">{t('Amount')} ↑</option>
        </select>
        <button type="submit" className="border px-2">
          {t('Filter')}
        </button>
      </form>
      <TransactionsTable transactions={txs} categories={categories} />
      {totalPages > 1 && (
        <div className="mt-2 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => {
            const p = i + 1;
            const sp = new URLSearchParams({ ...searchParams, page: String(p) });
            return (
              <a key={p} href={`?${sp.toString()}`} className={p === page ? 'font-bold' : ''}>
                {p}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
