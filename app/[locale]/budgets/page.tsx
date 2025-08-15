/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser } from '@/lib/auth/requireUser';
import { requireOrg } from '@/lib/auth/requireOrg';
import { prisma } from '@/lib/prisma';
import { getBudgetProgress, createBudget, updateBudget, deleteBudget } from '@/app/budgets/actions';
import { formatCurrencyIDR } from '@/lib/formatCurrencyIDR';
import { getTranslations } from 'next-intl/server';

export default async function BudgetsPage() {
  const t = await getTranslations();
  await requireUser();
  const orgId = await requireOrg();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const progress = await getBudgetProgress({ month, year });
  const categories = await prisma.category.findMany({
    where: { orgId, kind: { in: ['FIXED', 'VARIABLE'] } },
    orderBy: { name: 'asc' },
  });
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">{t('Budgets')}</h1>
      <table className="w-full text-sm border">
        <thead>
          <tr className="border-b">
            <th className="text-left p-1">{t('Category')}</th>
            <th className="text-right p-1">{t('Limit')}</th>
            <th className="text-right p-1">{t('Spent')}</th>
            <th className="text-right p-1">{t('Remaining')}</th>
            <th className="p-1">{t('Actions')}</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((p: any) => (
            <tr key={p.categoryId} className="border-b">
              <td className="p-1">{p.categoryName}</td>
              <td className="p-1 text-right">{formatCurrencyIDR(p.limit)}</td>
              <td className="p-1 text-right">{formatCurrencyIDR(p.spent)}</td>
              <td className="p-1 text-right">{formatCurrencyIDR(p.remaining)}</td>
              <td className="p-1">
                {p.budgetId && (
                  <form action={updateBudget as any} className="flex gap-1 mb-1">
                    <input type="hidden" name="id" value={p.budgetId} />
                    <input
                      type="number"
                      name="limit"
                      defaultValue={p.limit}
                      className="border p-1 w-24"
                    />
                    <button className="border px-2" type="submit">
                      {t('Save')}
                    </button>
                  </form>
                )}
                {p.budgetId && (
                  <form action={deleteBudget as any}>
                    <input type="hidden" name="id" value={p.budgetId} />
                    <button className="text-red-600" type="submit">
                      {t('Delete')}
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-6 mb-2 font-semibold">{t('Create Budget')}</h2>
      <form action={createBudget as any} className="flex flex-col gap-2 max-w-sm">
        <select name="categoryId" className="border p-1">
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="hidden" name="month" value={month} />
        <input type="hidden" name="year" value={year} />
        <input type="number" name="limit" className="border p-1" placeholder={t('Limit')} />
        <button type="submit" className="border px-2">
          {t('Save')}
        </button>
      </form>
    </div>
  );
}
