import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('@prisma/client', () => ({
  OrgRole: { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER' },
}));

vi.mock('../../lib/auth/requireUser', () => ({ requireUser: vi.fn() }));
vi.mock('../../lib/auth/requireOrg', () => ({ requireOrg: vi.fn().mockResolvedValue('org1') }));
vi.mock('../../lib/prisma', () => ({
  prisma: {
    goal: { findFirst: vi.fn() },
  },
}));
import { prisma } from '../../lib/prisma';
import { projectGoal } from './actions';

describe('projectGoal', () => {
  it('returns achieved when target met', async () => {
    (prisma.goal.findFirst as Mock).mockResolvedValue({ targetAmt: 100, savedAmt: 100 });
    const res = await projectGoal({ id: 'g1', monthlySave: 100 });
    expect(res).toEqual({ status: 'achieved' });
  });

  it('returns unreachable when monthlySave <=0', async () => {
    (prisma.goal.findFirst as Mock).mockResolvedValue({ targetAmt: 100, savedAmt: 0 });
    const res = await projectGoal({ id: 'g1', monthlySave: 0 });
    expect(res).toEqual({ status: 'unreachable' });
  });

  it('calculates months and eta', async () => {
    const fakeDate = new Date('2024-01-15T00:00:00Z');
    vi.useFakeTimers();
    vi.setSystemTime(fakeDate);
    (prisma.goal.findFirst as Mock).mockResolvedValue({ targetAmt: 1000, savedAmt: 200 });
    const res = await projectGoal({ id: 'g1', monthlySave: 100 });
    expect(res.monthsNeeded).toBe(8);
    expect(res.etaDate).toBeInstanceOf(Date);
    vi.useRealTimers();
  });
});
