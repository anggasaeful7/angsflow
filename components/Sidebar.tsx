import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Sidebar() {
  const t = useTranslations();
  return (
    <aside className="w-48 p-4 border-r">
      <nav className="flex flex-col gap-2">
        <Link href="/dashboard">{t('Dashboard')}</Link>
        <Link href="/transactions">{t('Transactions')}</Link>
        <Link href="/budgets">{t('Budgets')}</Link>
        <Link href="/goals">{t('Goals')}</Link>
        <Link href="/coach">{t('Coach')}</Link>
      </nav>
    </aside>
  );
}
