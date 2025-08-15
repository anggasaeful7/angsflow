'use client';
import { useTransition } from 'react';
import { updateTransactionCategory } from '@/app/transactions/actions';

interface Option {
  id: string;
  name: string;
  kind: string;
}

export default function CategorySelect({
  txId,
  value,
  options,
}: {
  txId: string;
  value: string | null;
  options: Option[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="border p-1"
      defaultValue={value || ''}
      onChange={(e) => {
        const categoryId = e.target.value || null;
        startTransition(() => updateTransactionCategory({ id: txId, categoryId }));
      }}
      disabled={isPending}
    >
      <option value="">-</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
