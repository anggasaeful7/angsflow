'use client';
import { useSession } from 'next-auth/react';

export default function OrgSwitcher() {
  const { data } = useSession();
  return <span>{data?.user?.activeOrgId}</span>;
}
