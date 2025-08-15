'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="p-4 space-y-4">
      <p>{t('Sumber data tidak tersedia')}</p>
      <button className="underline" onClick={() => reset()}>
        {t('Coba lagi')}
      </button>
      <a className="underline" href="https://github.com/angsflow/angsflow/issues" target="_blank">
        {t('Report issue')}
      </a>
    </div>
  );
}
