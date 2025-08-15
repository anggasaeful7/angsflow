import { describe, expect, it, vi, Mock } from 'vitest';

vi.mock('@prisma/client', () => ({
  OrgRole: { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER' },
}));
import { OrgRole } from '@prisma/client';

vi.mock('./hasOrgRole', () => ({ hasOrgRole: vi.fn() }));
import { hasOrgRole } from './hasOrgRole';
import { requireRole } from './requireRole';

describe('requireRole', () => {
  it('runs handler when authorized', async () => {
    const mockHas = hasOrgRole as unknown as Mock;
    mockHas.mockResolvedValue(true);
    const handler = vi.fn().mockResolvedValue('ok');
    const res = await requireRole({ userId: 'u', orgId: 'o', roles: [OrgRole.ADMIN] }, handler);
    expect(res).toBe('ok');
    expect(handler).toHaveBeenCalled();
  });

  it('throws when unauthorized', async () => {
    const mockHas = hasOrgRole as unknown as Mock;
    mockHas.mockResolvedValue(false);
    const handler = vi.fn();
    await expect(
      requireRole({ userId: 'u', orgId: 'o', roles: [OrgRole.ADMIN] }, handler),
    ).rejects.toHaveProperty('status', 403);
    expect(handler).not.toHaveBeenCalled();
  });
});
