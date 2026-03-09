import { hash } from 'bcryptjs';
import { prisma } from './prisma';

export async function seedAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';

  if (!adminUsername || !adminPassword) {
    console.log('No admin credentials configured, skipping admin seed');
    return null;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    return existingAdmin;
  }

  const hashedPassword = await hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrator',
      isAdmin: true,
    },
  });

  console.log('Admin user created:', admin.username);
  return admin;
}
