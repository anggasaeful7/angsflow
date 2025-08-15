import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('@prisma/client', () => ({
  OrgRole: { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER' },
}));

vi.mock('../../lib/auth/requireUser', () => ({ requireUser: vi.fn() }));
vi.mock('../../lib/auth/requireOrg', () => ({ requireOrg: vi.fn().mockResolvedValue('org1') }));

vi.mock('../../lib/prisma', () => ({
  prisma: {
    category: { findMany: vi.fn() },
    budget: { findMany: vi.fn() },
    transaction: { groupBy: vi.fn() },
  },
}));

import { prisma } from '../../lib/prisma';
import { getBudgetProgress } from './actions';

describe('getBudgetProgress', () => {
  it('calculates progress including categories without budgets', async () => {
    (prisma.category.findMany as Mock).mockResolvedValue([{ id: 'c1', name: 'Food' }]);
    (prisma.budget.findMany as Mock).mockResolvedValue([]);
    (prisma.transaction.groupBy as Mock).mockResolvedValue([
      { categoryId: 'c1', _sum: { amount: -200 } },
    ]);
    const res = await getBudgetProgress({ month: 1, year: 2024 });
    expect(res).toEqual([
      {
        budgetId: undefined,
        categoryId: 'c1',
        categoryName: 'Food',
        limit: 0,
        spent: 200,
        remaining: -200,
        percent: 0,
      },
    ]);
  });

  it('handles existing budget', async () => {
    (prisma.category.findMany as Mock).mockResolvedValue([{ id: 'c1', name: 'Food' }]);
    (prisma.budget.findMany as Mock).mockResolvedValue([
      { id: 'b1', categoryId: 'c1', limit: 1000 },
    ]);
    (prisma.transaction.groupBy as Mock).mockResolvedValue([
      { categoryId: 'c1', _sum: { amount: -200 } },
    ]);
    const res = await getBudgetProgress({ month: 1, year: 2024 });
    expect(res).toEqual([
      {
        budgetId: 'b1',
        categoryId: 'c1',
        categoryName: 'Food',
        limit: 1000,
        spent: 200,
        remaining: 800,
        percent: 20,
      },
    ]);
  });
});
