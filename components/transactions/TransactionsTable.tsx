'use client';
import { useTransition } from 'react';
import { deleteTransaction } from '@/app/transactions/actions';
import CategorySelect from '../CategorySelect';
import { formatDate } from '@/lib/date';
import { formatCurrencyIDR } from '@/lib/formatCurrencyIDR';
import { useTranslations } from 'next-intl';

interface Tx {
  id: string;
  occurredAt: string | Date;
  description?: string | null;
  categoryId?: string | null;
  amount: number;
}

interface Category {
  id: string;
  name: string;
  kind: string;
}

export default function TransactionsTable({
  transactions,
  categories,
}: {
  transactions: Tx[];
  categories: Category[];
}) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  return (
    <table className="w-full text-sm border">
      <thead>
        <tr>
          <th className="border p-1">{t('Date')}</th>
          <th className="border p-1">{t('Description')}</th>
          <th className="border p-1">{t('Category')}</th>
          <th className="border p-1">{t('Amount')}</th>
          <th className="border p-1">{t('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id} className="border-t">
            <td className="p-1">{formatDate(tx.occurredAt, 'yyyy-MM-dd')}</td>
            <td className="p-1">{tx.description}</td>
            <td className="p-1">
              <CategorySelect txId={tx.id} value={tx.categoryId || null} options={categories} />
            </td>
            <td className="p-1 text-right">{formatCurrencyIDR(tx.amount / 100)}</td>
            <td className="p-1 text-center">
              <button
                className="text-red-600"
                disabled={isPending}
                onClick={() => startTransition(() => deleteTransaction({ id: tx.id }))}
              >
                {t('Delete')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
