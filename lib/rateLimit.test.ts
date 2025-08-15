import { describe, expect, it, vi } from 'vitest';
import { limit, resetAll } from './rateLimit';

describe('rateLimit', () => {
  it('blocks after exceeding limit', async () => {
    await limit({ key: 'a', limit: 2, windowMs: 1000 });
    await limit({ key: 'a', limit: 2, windowMs: 1000 });
    await expect(limit({ key: 'a', limit: 2, windowMs: 1000 })).rejects.toThrow();
    await resetAll();
  });

  it('resets after window', async () => {
    vi.useFakeTimers();
    await limit({ key: 'b', limit: 1, windowMs: 1000 });
    vi.advanceTimersByTime(1000);
    await expect(limit({ key: 'b', limit: 1, windowMs: 1000 })).resolves.toBeTruthy();
    vi.useRealTimers();
    await resetAll();
  });
});
