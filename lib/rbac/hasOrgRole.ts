/* eslint-disable @typescript-eslint/no-explicit-any */
import { OrgRole } from '@prisma/client';
import { prisma } from '../prisma';

interface Params {
  userId: string;
  orgId: string;
  roles: OrgRole[];
}

export async function hasOrgRole({ userId, orgId, roles }: Params) {
  const membership = await (prisma as any).membership.findUnique({
    where: { orgId_userId: { orgId, userId } },
    select: { role: true },
  });
  if (!membership) return false;
  return roles.includes(membership.role);
}
