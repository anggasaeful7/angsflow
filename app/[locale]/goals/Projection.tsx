'use client';
import { useState, useTransition } from 'react';
import { projectGoal } from '@/app/goals/actions';
import { formatDate } from '@/lib/format';
import { useLocale, useTranslations } from 'next-intl';

type ProjectionResult =
  | { status: 'achieved' | 'unreachable' }
  | { monthsNeeded: number; etaDate: Date };

export default function Projection({ goalId }: { goalId: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const [monthly, setMonthly] = useState(0);
  const [result, setResult] = useState<ProjectionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        <input
          type="number"
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          className="border p-1 w-24"
          placeholder={t('Monthly Save')}
        />
        <button
          className="border px-2"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await projectGoal({ id: goalId, monthlySave: monthly });
              setResult(r);
            })
          }
        >
          {t('Projection')}
        </button>
      </div>
      {result &&
        ('status' in result ? (
          <p className="text-sm mt-1">
            {t(result.status === 'achieved' ? 'Achieved' : 'Unreachable')}
          </p>
        ) : (
          <p className="text-sm mt-1">
            {t('ETA')}: {result.monthsNeeded}m - {formatDate(result.etaDate, locale)}
          </p>
        ))}
    </div>
  );
}
