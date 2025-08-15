/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from './prisma';

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
