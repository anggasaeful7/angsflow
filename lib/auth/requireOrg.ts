import { redirect } from 'next/navigation';
import { requireUser } from './requireUser';

export async function requireOrg() {
  const user = await requireUser();
  if (!user.activeOrgId) {
    redirect('/orgs');
  }
  return user.activeOrgId;
}
