import { useTranslations } from 'next-intl';

export default function TransactionsPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Transactions')}</div>;
}
