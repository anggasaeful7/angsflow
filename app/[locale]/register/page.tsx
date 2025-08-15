'use client';
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
  const t = useTranslations();
  return <div className="p-4">{t('Register')}</div>;
}
