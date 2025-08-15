/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const p = prisma as any;
  const password = await hash('admin123', 10);
  const user = await p.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {},
    create: {
      email: 'admin@demo.local',
      password,
      name: 'Admin',
    },
  });

  const memberPwd = await hash('member123', 10);
  await p.user.upsert({
    where: { email: 'member@demo.local' },
    update: {},
    create: {
      email: 'member@demo.local',
      password: memberPwd,
      name: 'Member',
    },
  });

  const org = await p.organization.create({
    data: {
      name: 'Demo Org',
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: 'OWNER' },
      },
      categories: {
        createMany: {
          data: [
            { name: 'Income', kind: 'INCOME' },
            { name: 'Makan', kind: 'VARIABLE' },
            { name: 'Transport', kind: 'VARIABLE' },
            { name: 'Sewa', kind: 'FIXED' },
            { name: 'Utilitas', kind: 'FIXED' },
            { name: 'Hiburan', kind: 'VARIABLE' },
          ],
        },
      },
    },
  });

  await p.user.update({
    where: { id: user.id },
    data: { activeOrgId: org.id },
  });

  await p.invitation.create({
    data: {
      orgId: org.id,
      email: 'member@demo.local',
      token: 'demo-token',
      role: 'MEMBER',
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
