import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('@prisma/client', () => ({ OrgRole: { MEMBER: 'MEMBER' } }));
vi.mock('../prisma', () => ({
  prisma: {
    transaction: { aggregate: vi.fn(), groupBy: vi.fn() },
    category: { findMany: vi.fn() },
    goal: { findFirst: vi.fn() },
    advice: { create: vi.fn() },
  },
}));
vi.mock('../rbac/requireRole', () => ({
  requireRole: (_p: unknown, fn: () => unknown) => fn(),
}));

import { prisma } from '../prisma';
import { runTool } from './tools';

describe('ai tools', () => {
  it('getCashflow computes income and expense', async () => {
    const agg = prisma.transaction.aggregate as unknown as Mock;
    agg.mockResolvedValueOnce({ _sum: { amount: 1000 } });
    agg.mockResolvedValueOnce({ _sum: { amount: -400 } });
    const res = (await runTool(
      'getCashflow',
      { month: 1, year: 2024 },
      { orgId: 'o', userId: 'u' },
    )) as {
      month: number;
      year: number;
      income: number;
      expense: number;
      net: number;
    };
    expect(res).toEqual({ month: 1, year: 2024, income: 1000, expense: 400, net: 600 });
  });

  it('getTopSpending sorts by total desc', async () => {
    const grp = prisma.transaction.groupBy as unknown as Mock;
    grp.mockResolvedValueOnce([
      { categoryId: 'c1', _sum: { amount: -300 } },
      { categoryId: 'c2', _sum: { amount: -100 } },
    ]);
    (prisma.category.findMany as unknown as Mock).mockResolvedValueOnce([
      { id: 'c1', name: 'Food' },
      { id: 'c2', name: 'Fun' },
    ]);
    const res = (await runTool(
      'getTopSpending',
      { month: 1, year: 2024, limit: 5 },
      { orgId: 'o', userId: 'u' },
    )) as { categoryId: string; categoryName: string; total: number }[];
    expect(res[0]).toEqual({ categoryId: 'c1', categoryName: 'Food', total: 300 });
    expect(res[1]).toEqual({ categoryId: 'c2', categoryName: 'Fun', total: 100 });
  });

  it('projectGoal handles statuses', async () => {
    const gf = prisma.goal.findFirst as unknown as Mock;
    // achieved
    gf.mockResolvedValueOnce({ id: 'g1', targetAmt: 1000, savedAmt: 1000 });
    let res = (await runTool(
      'projectGoal',
      { goalId: 'g1', monthlySave: 100 },
      { orgId: 'o', userId: 'u' },
    )) as { status: string; monthsNeeded?: number | null };
    expect(res.status).toBe('achieved');
    // unreachable
    gf.mockResolvedValueOnce({ id: 'g1', targetAmt: 1000, savedAmt: 200 });
    res = (await runTool(
      'projectGoal',
      { goalId: 'g1', monthlySave: 0 },
      { orgId: 'o', userId: 'u' },
    )) as { status: string; monthsNeeded?: number | null };
    expect(res.status).toBe('unreachable');
    // estimated
    gf.mockResolvedValueOnce({ id: 'g1', targetAmt: 1000, savedAmt: 200 });
    res = (await runTool(
      'projectGoal',
      { goalId: 'g1', monthlySave: 200 },
      { orgId: 'o', userId: 'u' },
    )) as { status: string; monthsNeeded?: number | null };
    expect(res.status).toBe('estimated');
    expect(res.monthsNeeded).toBe(4);
  });

  it('suggestBudget averages last 3 months', async () => {
    const grp = prisma.transaction.groupBy as unknown as Mock;
    grp.mockResolvedValueOnce([{ categoryId: 'c1', _sum: { amount: -900 } }]);
    (prisma.category.findMany as unknown as Mock).mockResolvedValueOnce([
      { id: 'c1', name: 'Food' },
    ]);
    const res = (await runTool(
      'suggestBudget',
      { month: 4, year: 2024 },
      { orgId: 'o', userId: 'u' },
    )) as { categoryId: string; suggestedLimit: number }[];
    expect(res[0].suggestedLimit).toBe(300);
  });
});
