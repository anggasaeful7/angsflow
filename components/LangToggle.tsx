'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LangToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const segments = pathname.split('/');
  const locale = segments[1];
  const other = locale === 'id' ? 'en' : 'id';
  const newPath = ['/', other, ...segments.slice(2)].join('/');

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved && saved !== locale) {
      router.replace(['/', saved, ...segments.slice(2)].join('/'));
    }
  }, [locale, router, segments]);

  function toggle() {
    localStorage.setItem('locale', other);
    router.push(newPath);
  }

  return (
    <button aria-label={t('Change Language')} onClick={toggle}>
      {other === 'id' ? '🇮🇩 ID' : '🇺🇸 EN'}
    </button>
  );
}
