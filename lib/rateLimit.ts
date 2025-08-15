import { memoryStore, RateLimitStore } from './rateLimitStore';

const store: RateLimitStore = memoryStore;

export async function limit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  let rec = await store.get(key);
  if (!rec || rec.resetAt <= now) {
    rec = { count: 0, resetAt: now + windowMs };
  }
  rec.count += 1;
  await store.set(key, rec);
  if (rec.count > limit) {
    throw new Response('Too many requests', { status: 429 });
  }
  return { remaining: Math.max(0, limit - rec.count), resetAt: rec.resetAt };
}

export async function resetAll() {
  await store.clear();
}
