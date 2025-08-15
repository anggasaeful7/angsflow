/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { requireUser } from '../../lib/auth/requireUser';
import { requireOrg } from '../../lib/auth/requireOrg';
import { prisma } from '../../lib/prisma';
import { requireRole } from '../../lib/rbac/requireRole';
import { OrgRole } from '@prisma/client';
import { z } from 'zod';

const baseSchema = z.object({
  categoryId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  limit: z.number().int().min(0),
});

export async function createBudget(input: {
  categoryId: string;
  month: number;
  year: number;
  limit: number;
}) {
  const user = await requireUser();
  const orgId = await requireOrg();
  const data = baseSchema.parse(input);
  return requireRole({ userId: user.id, orgId, roles: [OrgRole.ADMIN, OrgRole.OWNER] }, () =>
    prisma.budget.create({ data: { ...data, orgId } }),
  );
}

const updateSchema = z.object({ id: z.string().min(1), limit: z.number().int().min(0) });
export async function updateBudget(input: { id: string; limit: number }) {
  const user = await requireUser();
  const orgId = await requireOrg();
  const data = updateSchema.parse(input);
  return requireRole(
    { userId: user.id, orgId, roles: [OrgRole.ADMIN, OrgRole.OWNER] },
    async () => {
      const b = await prisma.budget.findUnique({ where: { id: data.id } });
      if (!b || b.orgId !== orgId) throw new Response('Forbidden', { status: 403 });
      return prisma.budget.update({ where: { id: data.id }, data: { limit: data.limit } });
    },
  );
}

export async function deleteBudget(input: { id: string }) {
  const user = await requireUser();
  const orgId = await requireOrg();
  const data = z.object({ id: z.string().min(1) }).parse(input);
  return requireRole(
    { userId: user.id, orgId, roles: [OrgRole.ADMIN, OrgRole.OWNER] },
    async () => {
      const b = await prisma.budget.findUnique({ where: { id: data.id } });
      if (!b || b.orgId !== orgId) throw new Response('Forbidden', { status: 403 });
      await prisma.budget.delete({ where: { id: data.id } });
    },
  );
}

const progressSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
});
export async function getBudgetProgress(input: { month: number; year: number }) {
  await requireUser();
  const orgId = await requireOrg();
  const { month, year } = progressSchema.parse(input);
  const categories = await prisma.category.findMany({ where: { orgId } });
  const budgets = await prisma.budget.findMany({ where: { orgId, month, year } });
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const txGroups = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { orgId, occurredAt: { gte: start, lt: end }, amount: { lt: 0 } },
    _sum: { amount: true },
  });
  const spentMap = new Map<string, number>(
    txGroups.map((g: any) => [g.categoryId, Math.abs(g._sum.amount || 0)]),
  );
  return categories.map((c: any) => {
    const budget = budgets.find((b: any) => b.categoryId === c.id);
    const limit = budget?.limit ?? 0;
    const spent = spentMap.get(c.id) || 0;
    const remaining = limit - spent;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    return {
      budgetId: budget?.id,
      categoryId: c.id,
      categoryName: c.name,
      limit,
      spent,
      remaining,
      percent,
    };
  });
}
