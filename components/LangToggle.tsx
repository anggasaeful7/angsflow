'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function LangToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/');
  const locale = segments[1];
  const other = locale === 'id' ? 'en' : 'id';
  const newPath = ['/', other, ...segments.slice(2)].join('/');
  return <button onClick={() => router.push(newPath)}>{other.toUpperCase()}</button>;
}
