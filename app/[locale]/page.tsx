import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Landing() {
  const t = useTranslations();
  return (
    <div className="p-4">
      <h1>AngsFlow</h1>
      <Link href="/login" className="underline">
        {t('Login')}
      </Link>
    </div>
  );
}
