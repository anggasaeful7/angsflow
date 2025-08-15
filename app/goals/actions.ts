'use server';

import { requireUser } from '../../lib/auth/requireUser';
import { requireOrg } from '../../lib/auth/requireOrg';
import { prisma } from '../../lib/prisma';
import { requireRole } from '../../lib/rbac/requireRole';
import { OrgRole } from '@prisma/client';
import { z } from 'zod';
import { addMonths, endOfMonth } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const baseSchema = z.object({
  name: z.string().min(1),
  targetAmt: z.number().int().min(0),
  targetDate: z.date().optional(),
  priority: z.number().int().min(1).max(5).optional(),
});

export async function createGoal(input: {
  name: string;
  targetAmt: number;
  targetDate?: Date;
  priority?: number;
}) {
  const user = await requireUser();
  const orgId = await requireOrg();
  const data = baseSchema.parse(input);
  return requireRole({ userId: user.id, orgId, roles: [OrgRole.ADMIN, OrgRole.OWNER] }, () =>
    prisma.goal.create({ data: { ...data, orgId } }),
  );
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  targetAmt: z.number().int().min(0).optional(),
  targetDate: z.date().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  savedAmt: z.number().int().min(0).optional(),
});
export async function updateGoal(input: {
  id: string;
  name?: string;
  targetAmt?: number;
  targetDate?: Date;
  priority?: number;
  savedAmt?: number;
}) {
  const user = await requireUser();
  const orgId = await requireOrg();
  const data = updateSchema.parse(input);
  return requireRole(
    { userId: user.id, orgId, roles: [OrgRole.ADMIN, OrgRole.OWNER] },
    async () => {
      const goal = await prisma.goal.findUnique({ where: { id: data.id } });
      if (!goal || goal.orgId !== orgId) throw new Response('Forbidden', { status: 403 });
      return prisma.goal.update({ where: { id: data.id }, data });
    },
  );
}

export async function deleteGoal(input: { id: string }) {
  const user = await requireUser();
  const orgId = await requireOrg();
  const data = z.object({ id: z.string().min(1) }).parse(input);
  return requireRole(
    { userId: user.id, orgId, roles: [OrgRole.ADMIN, OrgRole.OWNER] },
    async () => {
      const goal = await prisma.goal.findUnique({ where: { id: data.id } });
      if (!goal || goal.orgId !== orgId) throw new Response('Forbidden', { status: 403 });
      await prisma.goal.delete({ where: { id: data.id } });
    },
  );
}

const projectSchema = z.object({ id: z.string().min(1), monthlySave: z.number().int() });
export async function projectGoal(input: { id: string; monthlySave: number }) {
  await requireUser();
  const orgId = await requireOrg();
  const { id, monthlySave } = projectSchema.parse(input);
  const goal = await prisma.goal.findFirst({ where: { id, orgId } });
  if (!goal) throw new Error('Not found');
  if (goal.targetAmt <= goal.savedAmt) return { status: 'achieved' } as const;
  if (monthlySave <= 0) return { status: 'unreachable' } as const;
  const remaining = goal.targetAmt - goal.savedAmt;
  const monthsNeeded = Math.ceil(remaining / monthlySave);
  const now = utcToZonedTime(new Date(), 'Asia/Jakarta');
  const etaDate = addMonths(endOfMonth(now), monthsNeeded);
  return { monthsNeeded, etaDate };
}
