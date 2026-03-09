import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canCreateActiveUser, getActiveUserCount, MAX_ACTIVE_USERS } from '@/lib/user-limits';
import { z } from 'zod';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const [users, activeCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            topics: true,
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    getActiveUserCount(),
  ]);

  return NextResponse.json({
    users,
    activeCount,
    maxActiveUsers: MAX_ACTIVE_USERS,
  });
}

const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  isAdmin: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, email, password, name, isAdmin, isActive } = result.data;

    if (isActive) {
      const canCreate = await canCreateActiveUser();
      if (!canCreate) {
        return NextResponse.json(
          { error: `Cannot create active user. Maximum of ${MAX_ACTIVE_USERS} active users reached.` },
          { status: 403 }
        );
      }
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        isAdmin,
        isActive,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
