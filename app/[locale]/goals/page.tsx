/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireUser } from '@/lib/auth/requireUser';
import { requireOrg } from '@/lib/auth/requireOrg';
import { prisma } from '@/lib/prisma';
import { createGoal, updateGoal, deleteGoal } from '@/app/goals/actions';
import { formatCurrencyIDR } from '@/lib/formatCurrencyIDR';
import { getTranslations } from 'next-intl/server';
import Projection from './Projection';

export default async function GoalsPage() {
  const t = await getTranslations();
  await requireUser();
  const orgId = await requireOrg();
  const goals = await prisma.goal.findMany({ where: { orgId }, orderBy: { priority: 'asc' } });
  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">{t('Goals')}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((g: any) => (
          <div key={g.id} className="border p-2">
            <h3 className="font-semibold">{g.name}</h3>
            <p>
              {formatCurrencyIDR(g.savedAmt)} / {formatCurrencyIDR(g.targetAmt)}
            </p>
            <Projection goalId={g.id} />
            <form action={updateGoal as any} className="mt-2 flex gap-1">
              <input type="hidden" name="id" value={g.id} />
              <input
                type="number"
                name="savedAmt"
                defaultValue={g.savedAmt}
                className="border p-1 w-24"
              />
              <button className="border px-2">{t('Save')}</button>
            </form>
            <form action={deleteGoal as any} className="mt-1">
              <input type="hidden" name="id" value={g.id} />
              <button className="text-red-600" type="submit">
                {t('Delete')}
              </button>
            </form>
          </div>
        ))}
      </div>
      <h2 className="mt-6 mb-2 font-semibold">{t('Create Goal')}</h2>
      <form action={createGoal as any} className="flex flex-col gap-2 max-w-sm">
        <input name="name" className="border p-1" placeholder={t('Goal Name')} />
        <input
          type="number"
          name="targetAmt"
          className="border p-1"
          placeholder={t('Target Amount')}
        />
        <button type="submit" className="border px-2">
          {t('Save')}
        </button>
      </form>
    </div>
  );
}
