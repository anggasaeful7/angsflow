'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) router.push('/dashboard');
  }

  return (
    <form onSubmit={onSubmit} className="p-4 flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('Email')}
        className="border p-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('Password')}
        className="border p-2"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">
        {t('Login')}
      </button>
    </form>
  );
}
