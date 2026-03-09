import { prisma } from './prisma';

export const MAX_ACTIVE_USERS = 10;

export async function getActiveUserCount(): Promise<number> {
  return prisma.user.count({
    where: { isActive: true },
  });
}

export async function canCreateActiveUser(): Promise<boolean> {
  const count = await getActiveUserCount();
  return count < MAX_ACTIVE_USERS;
}
