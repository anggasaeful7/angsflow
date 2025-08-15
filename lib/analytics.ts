/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './prisma';
import { startOfMonth, subMonths, addMonths } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

interface MonthYear {
  orgId: string;
  month: number;
  year: number;
}

export async function getMonthlyCashflow({ orgId, month, year }: MonthYear) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const incomeAgg = await prisma.transaction.aggregate({
    where: { orgId, occurredAt: { gte: start, lt: end }, amount: { gt: 0 } },
    _sum: { amount: true },
  });
  const expenseAgg = await prisma.transaction.aggregate({
    where: { orgId, occurredAt: { gte: start, lt: end }, amount: { lt: 0 } },
    _sum: { amount: true },
  });
  const income = incomeAgg._sum.amount || 0;
  const expense = Math.abs(expenseAgg._sum.amount || 0);
  return { income, expense, net: income - expense };
}

export async function getTopSpending({
  orgId,
  month,
  year,
  limit = 5,
}: MonthYear & { limit?: number }) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const groups: { categoryId: string; _sum: { amount: number | null } }[] =
    await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { orgId, occurredAt: { gte: start, lt: end }, amount: { lt: 0 } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'asc' } },
      take: limit,
    });
  const categoryIds = groups.map((g) => g.categoryId).filter(Boolean) as string[];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });
  const nameMap = new Map<string, string>(categories.map((c: any) => [c.id, c.name]));
  return groups.map((g) => ({
    categoryId: g.categoryId,
    categoryName: nameMap.get(g.categoryId) || 'Unknown',
    spent: Math.abs(g._sum.amount || 0),
  }));
}

export async function getBudgetsOverview({ orgId, month, year }: MonthYear) {
  const budgets = await prisma.budget.aggregate({
    where: { orgId, month, year },
    _sum: { limit: true },
  });
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const expenseAgg = await prisma.transaction.aggregate({
    where: { orgId, occurredAt: { gte: start, lt: end }, amount: { lt: 0 } },
    _sum: { amount: true },
  });
  const totalLimit = budgets._sum.limit || 0;
  const totalSpent = Math.abs(expenseAgg._sum.amount || 0);
  return { totalLimit, totalSpent, totalRemaining: totalLimit - totalSpent };
}

export function getBurnRate({ income, expense }: { income: number; expense: number }) {
  return expense / Math.max(income, 1);
}

export async function getMonthlySeries({
  orgId,
  monthsBack = 12,
}: {
  orgId: string;
  monthsBack?: number;
}) {
  const tz = 'Asia/Jakarta';
  const now = utcToZonedTime(new Date(), tz);
  const currentStart = startOfMonth(now);
  const months: Date[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    months.push(subMonths(currentStart, i));
  }
  const map = new Map<string, { income: number; expense: number }>();
  months.forEach((d) => {
    map.set(`${d.getFullYear()}-${d.getMonth()}`, { income: 0, expense: 0 });
  });
  const startUtc = zonedTimeToUtc(months[0], tz);
  const endUtc = zonedTimeToUtc(addMonths(currentStart, 1), tz);
  const txs = await prisma.transaction.findMany({
    where: { orgId, occurredAt: { gte: startUtc, lt: endUtc } },
    select: { occurredAt: true, amount: true },
  });
  for (const tx of txs) {
    const local = utcToZonedTime(tx.occurredAt, tz);
    const key = `${local.getFullYear()}-${local.getMonth()}`;
    const rec = map.get(key);
    if (!rec) continue;
    if (tx.amount > 0) rec.income += tx.amount;
    else rec.expense += Math.abs(tx.amount);
  }
  const series = months.map((d) => {
    const rec = map.get(`${d.getFullYear()}-${d.getMonth()}`)!;
    const income = rec.income;
    const expense = rec.expense;
    return {
      y: d.getFullYear(),
      m: d.getMonth() + 1,
      income,
      expense,
      net: income - expense,
    };
  });
  return series;
}

export async function getCategoryBreakdown({
  orgId,
  month,
  year,
}: {
  orgId: string;
  month: number;
  year: number;
}) {
  const tz = 'Asia/Jakarta';
  const start = zonedTimeToUtc(new Date(year, month - 1, 1), tz);
  const end = zonedTimeToUtc(addMonths(new Date(year, month - 1, 1), 1), tz);
  const groups: { categoryId: string; _sum: { amount: number | null } }[] =
    await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { orgId, occurredAt: { gte: start, lt: end }, amount: { lt: 0 } },
      _sum: { amount: true },
    });
  const categoryIds = groups.map((g) => g.categoryId).filter(Boolean) as string[];
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
  });
  const nameMap = new Map<string, string>(categories.map((c: any) => [c.id, c.name]));
  return groups
    .map((g) => ({
      categoryId: g.categoryId,
      categoryName: nameMap.get(g.categoryId) || 'Unknown',
      total: Math.abs(g._sum.amount || 0),
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getAdviceRecent({
  orgId,
  userId,
  limit = 5,
}: {
  orgId: string;
  userId: string;
  limit?: number;
}) {
  return prisma.advice.findMany({
    where: { orgId, userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
