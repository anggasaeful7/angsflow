import { useTranslations } from 'next-intl';

export default function BudgetsPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Budgets')}</div>;
}
