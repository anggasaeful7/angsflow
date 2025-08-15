import { OrgRole } from '@prisma/client';
import { hasOrgRole } from './hasOrgRole';

interface Params {
  userId: string;
  orgId: string;
  roles: OrgRole[];
}

export async function requireRole<T>(params: Params, fn: () => Promise<T>) {
  const allowed = await hasOrgRole(params);
  if (!allowed) {
    throw new Response('Forbidden', { status: 403 });
  }
  return fn();
}
