'use server';

import { requireUser } from '@/lib/auth/requireUser';
import { requireOrg } from '@/lib/auth/requireOrg';
import { prisma } from '@/lib/prisma';
import { parseTransactions } from '@/lib/csv/parseTransactions';
import { matchRule, RuleLike } from '@/lib/ruleMatcher';

interface ImportData {
  orgId: string;
  occurredAt: Date;
  amount: number;
  description?: string;
  categoryId: string | null;
  source: string;
}

export async function importTransactions(formData: FormData) {
  await requireUser();
  const orgId = await requireOrg();
  const file = formData.get('file') as File | null;
  if (!file) {
    return { insertedCount: 0, errorCount: 1, errors: [{ line: 0, error: 'No file' }] };
  }
  const text = await file.text();
  const { rows, errors } = await parseTransactions(text);

  const rules = (await prisma.rule.findMany({
    where: { orgId, active: true },
  })) as RuleLike[];

  const seen = new Set<string>();
  const data: ImportData[] = [];

  for (const r of rows) {
    const key = `${r.occurredAt.getTime()}|${r.amountCents}|${r.description ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const categoryId = matchRule(r.description || '', rules);
    const amount = r.isIncome ? r.amountCents : -r.amountCents;
    data.push({
      orgId,
      occurredAt: r.occurredAt,
      amount,
      description: r.description,
      categoryId,
      source: 'csv',
    });
  }

  let insertedCount = 0;
  if (data.length > 0) {
    const result = await prisma.transaction.createMany({ data });
    insertedCount = result.count;
  }
  return {
    insertedCount,
    errorCount: errors.length,
    errors,
    previewTopMatches: data
      .slice(0, 5)
      .map((d) => ({ description: d.description, categoryId: d.categoryId })),
  };
}

export async function updateTransactionCategory({
  id,
  categoryId,
}: {
  id: string;
  categoryId: string | null;
}) {
  await requireUser();
  const orgId = await requireOrg();
  const res = await prisma.transaction.updateMany({
    where: { id, orgId },
    data: { categoryId },
  });
  if (res.count === 0) throw new Error('Not found');
}

export async function deleteTransaction({ id }: { id: string }) {
  await requireUser();
  const orgId = await requireOrg();
  await prisma.transaction.deleteMany({ where: { id, orgId } });
}

export async function listTransactions({
  orgId,
  q,
  categoryId,
  sort = 'dateDesc',
  page = 1,
  pageSize = 20,
}: {
  orgId: string;
  q?: string;
  categoryId?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const where: {
    orgId: string;
    description?: { contains: string; mode: 'insensitive' };
    categoryId?: string;
  } = { orgId };
  if (q) where.description = { contains: q, mode: 'insensitive' };
  if (categoryId) where.categoryId = categoryId;
  const orderBy =
    sort === 'dateAsc'
      ? { occurredAt: 'asc' }
      : sort === 'amountAsc'
        ? { amount: 'asc' }
        : sort === 'amountDesc'
          ? { amount: 'desc' }
          : { occurredAt: 'desc' };

  const txs = await prisma.transaction.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { category: true },
  });
  const total = await prisma.transaction.count({ where });
  return { txs, total };
}

export async function countByCategory({
  orgId,
  month,
  year,
}: {
  orgId: string;
  month: number;
  year: number;
}) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { orgId, occurredAt: { gte: start, lt: end } },
    _sum: { amount: true },
  });
}
