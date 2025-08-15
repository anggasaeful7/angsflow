import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('./prisma', () => ({
  prisma: {
    transaction: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    advice: {
      findMany: vi.fn(),
    },
  },
}));
import { prisma } from './prisma';
import {
  getMonthlyCashflow,
  getBurnRate,
  getMonthlySeries,
  getCategoryBreakdown,
} from './analytics';

describe('analytics', () => {
  it('computes cashflow correctly', async () => {
    const agg = prisma.transaction.aggregate as Mock;
    agg.mockResolvedValueOnce({ _sum: { amount: 1000 } }); // income
    agg.mockResolvedValueOnce({ _sum: { amount: -400 } }); // expense
    const res = await getMonthlyCashflow({ orgId: 'o', month: 1, year: 2024 });
    expect(res).toEqual({ income: 1000, expense: 400, net: 600 });
  });

  it('burn rate', () => {
    const br = getBurnRate({ income: 1000, expense: 500 });
    expect(br).toBe(0.5);
  });

  it('monthly series returns fixed number of points and respects timezone', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T00:00:00Z'));
    const find = prisma.transaction.findMany as Mock;
    find.mockResolvedValueOnce([
      { amount: 100, occurredAt: new Date('2024-02-29T17:00:00Z') }, // Mar 1 local
      { amount: -50, occurredAt: new Date('2024-02-10T00:00:00Z') },
    ]);
    const res = await getMonthlySeries({ orgId: 'o', monthsBack: 2 });
    vi.useRealTimers();
    expect(res).toEqual([
      { y: 2024, m: 2, income: 0, expense: 50, net: -50 },
      { y: 2024, m: 3, income: 100, expense: 0, net: 100 },
    ]);
  });

  it('category breakdown aggregates expenses and sorts', async () => {
    const groupBy = prisma.transaction.groupBy as Mock;
    groupBy.mockResolvedValueOnce([
      { categoryId: 'c1', _sum: { amount: -300 } },
      { categoryId: 'c2', _sum: { amount: -100 } },
    ]);
    const cat = prisma.category.findMany as Mock;
    cat.mockResolvedValueOnce([
      { id: 'c1', name: 'Food' },
      { id: 'c2', name: 'Travel' },
    ]);
    const res = await getCategoryBreakdown({ orgId: 'o', month: 1, year: 2024 });
    expect(res).toEqual([
      { categoryId: 'c1', categoryName: 'Food', total: 300 },
      { categoryId: 'c2', categoryName: 'Travel', total: 100 },
    ]);
  });
});
