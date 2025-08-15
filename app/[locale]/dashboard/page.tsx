import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Dashboard')}</div>;
}
