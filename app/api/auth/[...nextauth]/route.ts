import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { limit } from '@/lib/rateLimit';
import type { NextRequest } from 'next/server';

const handler = NextAuth(authOptions);

export async function POST(req: NextRequest, ctx: unknown) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  try {
    await limit({ key: `${ip}:auth`, limit: 10, windowMs: 10 * 60 * 1000 });
  } catch (e) {
    return new Response('Too many requests', { status: 429 });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handler(req, ctx as any);
}

export { handler as GET };
export const runtime = 'nodejs';
