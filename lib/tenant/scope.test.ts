import { describe, expect, it } from 'vitest';
import { scope } from './scope';

describe('scope', () => {
  it('adds orgId into where', () => {
    const q = scope('o', { where: { name: 'x' } });
    expect(q).toEqual({ where: { name: 'x', orgId: 'o' } });
  });

  it('creates where when missing', () => {
    const q = scope('o', {} as Record<string, unknown>);
    expect(q).toEqual({ where: { orgId: 'o' } });
  });
});
