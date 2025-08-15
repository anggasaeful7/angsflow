import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
  const password = await hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.local' },
    update: {},
    create: {
      email: 'admin@demo.local',
      password,
      name: 'Admin',
    },
  });

  const org = await prisma.organization.create({
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

  await prisma.user.update({
    where: { id: user.id },
    data: { activeOrgId: org.id },
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
