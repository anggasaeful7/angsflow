'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import LangToggle from './LangToggle';
import ThemeToggle from './ThemeToggle';
import OrgSwitcher from './OrgSwitcher';

export default function Navbar() {
  const t = useTranslations();
  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <div className="flex gap-4">
        <Link href="/dashboard">{t('Dashboard')}</Link>
        <Link href="/transactions">{t('Transactions')}</Link>
      </div>
      <div className="flex items-center gap-2">
        <OrgSwitcher />
        <LangToggle />
        <ThemeToggle />
        <button onClick={() => signOut()}>{t('Logout')}</button>
      </div>
    </nav>
  );
}
