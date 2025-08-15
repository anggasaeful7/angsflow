import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('./prisma', () => ({
  prisma: {
    transaction: {
      aggregate: vi.fn(),
    },
  },
}));
import { prisma } from './prisma';
import { getMonthlyCashflow, getBurnRate } from './analytics';

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
});
