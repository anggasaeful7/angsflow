import { useTranslations } from 'next-intl';

export default function OrgsPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Organization')}</div>;
}
