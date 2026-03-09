import { hash } from 'bcryptjs';
import { prisma } from './prisma';

export type SeedResult = {
  user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  action: 'created' | 'exists' | 'reset' | 'skipped';
};

/**
 * Seeds the admin user from environment variables.
 * This bypasses the active user limit intentionally.
 *
 * @param reset - If true and admin exists, resets password from env vars
 */
export async function seedAdminUser(reset = false): Promise<SeedResult> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhost';

  if (!adminUsername || !adminPassword) {
    console.log('No admin credentials configured, skipping admin seed');
    return { user: null, action: 'skipped' };
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    if (reset) {
      const hashedPassword = await hash(adminPassword, 12);
      const updatedAdmin = await prisma.user.update({
        where: { username: adminUsername },
        data: { password: hashedPassword },
      });
      console.log('Admin password reset:', updatedAdmin.username);
      return { user: updatedAdmin, action: 'reset' };
    }

    console.log('Admin user already exists');
    return { user: existingAdmin, action: 'exists' };
  }

  const hashedPassword = await hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      name: 'Administrator',
      isAdmin: true,
      isActive: true,
    },
  });

  console.log('Admin user created:', admin.username);
  return { user: admin, action: 'created' };
}
