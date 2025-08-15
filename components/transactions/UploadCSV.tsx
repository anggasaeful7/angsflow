'use client';
import { useState, useTransition } from 'react';
import { importTransactions } from '@/app/transactions/actions';
import { useTranslations } from 'next-intl';

interface ImportError {
  line: number;
  error: string;
}

interface ImportResult {
  insertedCount: number;
  errorCount: number;
  errors?: ImportError[];
}

export default function UploadCSV() {
  const t = useTranslations();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  async function action(formData: FormData) {
    startTransition(async () => {
      const res = await importTransactions(formData);
      setResult(res);
    });
  }

  return (
    <form action={action} className="mb-4 rounded border p-4" encType="multipart/form-data">
      <input type="file" name="file" accept=".csv,text/csv" className="mb-2" />
      <button type="submit" disabled={isPending} className="border px-2 py-1">
        {t('Upload CSV')}
      </button>
      {result && (
        <div className="mt-2 text-sm">
          <div>
            {t('Inserted')}: {result.insertedCount} | {t('Errors')}: {result.errorCount}
          </div>
          {result.errors?.length && (
            <details className="mt-1">
              <summary>{t('Row Errors')}</summary>
              <ul className="ml-4 list-disc">
                {result.errors.map((e) => (
                  <li key={e.line}>
                    {e.line}: {e.error}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </form>
  );
}
