import { useTranslations } from 'next-intl';

export default function CoachPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Coach')}</div>;
}
