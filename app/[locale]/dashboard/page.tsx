/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser } from '@/lib/auth/requireUser';
import { requireOrg } from '@/lib/auth/requireOrg';
import {
  getMonthlyCashflow,
  getTopSpending,
  getBudgetsOverview,
  getBurnRate,
} from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { formatCurrencyIDR } from '@/lib/formatCurrencyIDR';
import { getTranslations } from 'next-intl/server';

export default async function DashboardPage() {
  const t = await getTranslations();
  await requireUser();
  const orgId = await requireOrg();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const cash = await getMonthlyCashflow({ orgId, month, year });
  const burn = getBurnRate(cash);
  const top = await getTopSpending({ orgId, month, year });
  const overview = await getBudgetsOverview({ orgId, month, year });
  const goals = await prisma.goal.findMany({
    where: { orgId },
    orderBy: { priority: 'asc' },
    take: 3,
  });
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl">{t('Dashboard')}</h1>
      <div>
        <p>
          {t('Income')}: {formatCurrencyIDR(cash.income)}
        </p>
        <p>
          {t('Expense')}: {formatCurrencyIDR(cash.expense)}
        </p>
        <p>
          {t('Net')}: {formatCurrencyIDR(cash.net)}
        </p>
        <p>
          {t('Burn Rate')}: {(burn * 100).toFixed(0)}%
        </p>
      </div>
      <div>
        <p>
          {t('Total Limit')}: {formatCurrencyIDR(overview.totalLimit)}
        </p>
        <p>
          {t('Total Spent')}: {formatCurrencyIDR(overview.totalSpent)}
        </p>
        <p>
          {t('Remaining')}: {formatCurrencyIDR(overview.totalRemaining)}
        </p>
      </div>
      <div>
        <h2 className="font-semibold">{t('Top Spending')}</h2>
        <ul>
          {top.map((s: any) => (
            <li key={s.categoryId}>
              {s.categoryName}: {formatCurrencyIDR(s.spent)}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold">{t('Goals')}</h2>
        <ul>
          {goals.map((g: any) => (
            <li key={g.id}>
              {g.name}: {formatCurrencyIDR(g.savedAmt)} / {formatCurrencyIDR(g.targetAmt)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
