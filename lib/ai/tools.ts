import { OrgRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { requireRole } from '../rbac/requireRole';
import { addMonths, endOfMonth } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

export class ToolError extends Error {}

const cashflowSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});

async function getCashflow(
  { month, year, orgId }: { month: number; year: number; orgId: string },
  userId: string,
) {
  return requireRole({ userId, orgId, roles: [OrgRole.MEMBER] }, async () => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const [inc, exp] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          orgId,
          occurredAt: { gte: start, lt: end },
          amount: { gt: 0 },
        },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          orgId,
          occurredAt: { gte: start, lt: end },
          amount: { lt: 0 },
        },
      }),
    ]);
    const income = inc._sum.amount ?? 0;
    const expense = Math.abs(exp._sum.amount ?? 0);
    return { month, year, income, expense, net: income - expense };
  });
}

const topSpendingSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
  limit: z.number().int().min(1).max(10).default(5),
});

async function getTopSpending(
  { month, year, limit, orgId }: { month: number; year: number; limit: number; orgId: string },
  userId: string,
) {
  return requireRole({ userId, orgId, roles: [OrgRole.MEMBER] }, async () => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const grouped = (await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        orgId,
        occurredAt: { gte: start, lt: end },
        amount: { lt: 0 },
        categoryId: { not: null },
      },
      orderBy: { _sum: { amount: 'asc' } },
      take: limit,
    })) as { categoryId: string | null; _sum: { amount: number | null } }[];
    const ids = grouped.map((g) => g.categoryId!).filter(Boolean) as string[];
    const cats = (await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    })) as { id: string; name: string }[];
    const nameMap = Object.fromEntries(cats.map((c) => [c.id, c.name] as const));
    return grouped.map((g) => ({
      categoryId: g.categoryId!,
      categoryName: nameMap[g.categoryId!] || 'Unknown',
      total: Math.abs(g._sum.amount ?? 0),
    }));
  });
}

const suggestBudgetSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int(),
});

async function suggestBudget(
  { month, year, orgId }: { month: number; year: number; orgId: string },
  userId: string,
) {
  return requireRole({ userId, orgId, roles: [OrgRole.MEMBER] }, async () => {
    const start = addMonths(new Date(year, month - 1, 1), -3);
    const end = new Date(year, month - 1, 1);
    const grouped = (await prisma.transaction.groupBy({
      by: ['categoryId'],
      _sum: { amount: true },
      where: {
        orgId,
        occurredAt: { gte: start, lt: end },
        amount: { lt: 0 },
        category: { kind: 'VARIABLE' },
      },
    })) as { categoryId: string | null; _sum: { amount: number | null } }[];
    const ids = grouped.map((g) => g.categoryId!).filter(Boolean) as string[];
    const cats = (await prisma.category.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    })) as { id: string; name: string }[];
    const nameMap = Object.fromEntries(cats.map((c) => [c.id, c.name] as const));
    return grouped.map((g) => {
      const avg = Math.abs(g._sum.amount ?? 0) / 3;
      const suggestedLimit = Math.max(Math.round(avg), 0);
      return {
        categoryId: g.categoryId!,
        categoryName: nameMap[g.categoryId!] || 'Unknown',
        suggestedLimit,
        rationale: `Rerata 3 bulan: ${suggestedLimit}`,
      };
    });
  });
}

const projectGoalSchema = z.object({
  goalId: z.string(),
  monthlySave: z.number().int().min(0),
});

async function projectGoal(
  { goalId, monthlySave, orgId }: { goalId: string; monthlySave: number; orgId: string },
  userId: string,
) {
  return requireRole({ userId, orgId, roles: [OrgRole.MEMBER] }, async () => {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, orgId } });
    if (!goal) throw new ToolError('Goal not found');
    const remaining = goal.targetAmt - goal.savedAmt;
    if (remaining <= 0) {
      return {
        goalId,
        monthsNeeded: 0,
        etaDateISO: new Date().toISOString(),
        status: 'achieved' as const,
      };
    }
    if (monthlySave <= 0) {
      return {
        goalId,
        monthsNeeded: null,
        etaDateISO: null,
        status: 'unreachable' as const,
      };
    }
    const monthsNeeded = Math.ceil(remaining / monthlySave);
    const eta = endOfMonth(addMonths(new Date(), monthsNeeded));
    const zoned = utcToZonedTime(eta, 'Asia/Jakarta');
    return { goalId, monthsNeeded, etaDateISO: zoned.toISOString(), status: 'estimated' as const };
  });
}

const createAdviceSchema = z.object({
  title: z.string(),
  message: z.string(),
  meta: z.any().optional(),
});

async function createAdvice(
  {
    title,
    message,
    meta,
    orgId,
  }: { title: string; message: string; meta?: unknown; orgId: string },
  userId: string,
) {
  return requireRole({ userId, orgId, roles: [OrgRole.MEMBER] }, async () => {
    const advice = await prisma.advice.create({
      data: { title, message, metaJson: meta ?? null, orgId, userId },
      select: { id: true },
    });
    return { adviceId: advice.id };
  });
}

export const toolConfigs = {
  getCashflow: {
    schema: cashflowSchema,
    parameters: {
      type: 'object',
      properties: {
        month: { type: 'number' },
        year: { type: 'number' },
      },
      required: ['month', 'year'],
    },
    exec: getCashflow,
  },
  getTopSpending: {
    schema: topSpendingSchema,
    parameters: {
      type: 'object',
      properties: {
        month: { type: 'number' },
        year: { type: 'number' },
        limit: { type: 'number', default: 5 },
      },
      required: ['month', 'year'],
    },
    exec: getTopSpending,
  },
  suggestBudget: {
    schema: suggestBudgetSchema,
    parameters: {
      type: 'object',
      properties: {
        month: { type: 'number' },
        year: { type: 'number' },
      },
      required: ['month', 'year'],
    },
    exec: suggestBudget,
  },
  projectGoal: {
    schema: projectGoalSchema,
    parameters: {
      type: 'object',
      properties: {
        goalId: { type: 'string' },
        monthlySave: { type: 'number' },
      },
      required: ['goalId', 'monthlySave'],
    },
    exec: projectGoal,
  },
  createAdvice: {
    schema: createAdviceSchema,
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        meta: { type: 'object' },
      },
      required: ['title', 'message'],
    },
    exec: createAdvice,
  },
};

export type ToolName = keyof typeof toolConfigs;

export const aiToolDefinitions = Object.entries(toolConfigs).map(([name, t]) => ({
  type: 'function',
  function: { name, parameters: t.parameters },
}));

export async function runTool(name: string, args: unknown, ctx: { orgId: string; userId: string }) {
  const conf = (toolConfigs as Record<string, unknown>)[name];
  if (!conf || typeof conf !== 'object') throw new ToolError('Unknown tool');
  const cfg = conf as {
    schema: z.ZodTypeAny;
    exec: (args: Record<string, unknown>, userId: string) => Promise<unknown>;
  };
  const input = cfg.schema.parse(args);
  try {
    return await cfg.exec({ ...input, orgId: ctx.orgId }, ctx.userId);
  } catch (e: unknown) {
    if (e instanceof ToolError) throw e;
    if (e instanceof Error) throw new ToolError(e.message);
    throw new ToolError('Tool error');
  }
}
