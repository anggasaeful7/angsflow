'use server';

import { requireUser } from '@/lib/auth/requireUser';
import { limit } from '@/lib/rateLimit';

export async function sendMessage({ message }: { message: string }) {
  const user = await requireUser();
  try {
    await limit({ key: `${user.id}:coach`, limit: 1, windowMs: 2000 });
  } catch {
    throw new Response('Too many requests', { status: 429 });
  }
  return { reply: `Received: ${message}` };
}
