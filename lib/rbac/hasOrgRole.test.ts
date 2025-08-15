/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('@prisma/client', () => ({
  OrgRole: { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER' },
}));
import { OrgRole } from '@prisma/client';

vi.mock('../prisma', () => ({
  prisma: {
    membership: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../prisma';
import { hasOrgRole } from './hasOrgRole';

describe('hasOrgRole', () => {
  it('returns true when role is allowed', async () => {
    const findUnique = (prisma as any).membership.findUnique as Mock;
    findUnique.mockResolvedValue({ role: OrgRole.ADMIN });
    const res = await hasOrgRole({ userId: 'u', orgId: 'o', roles: [OrgRole.ADMIN] });
    expect(res).toBe(true);
  });

  it('returns false when membership missing', async () => {
    const findUnique = (prisma as any).membership.findUnique as Mock;
    findUnique.mockResolvedValue(null);
    const res = await hasOrgRole({ userId: 'u', orgId: 'o', roles: [OrgRole.ADMIN] });
    expect(res).toBe(false);
  });
});
