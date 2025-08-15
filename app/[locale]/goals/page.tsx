import { useTranslations } from 'next-intl';

export default function GoalsPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Goals')}</div>;
}
