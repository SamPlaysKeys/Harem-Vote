import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { canCreateActiveUser, MAX_ACTIVE_USERS } from '@/lib/user-limits';
import { z } from 'zod';

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return null;
  }
  return session;
}

const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  name: z.string().min(1).max(100).optional(),
  isAdmin: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id: userId } = await params;

  try {
    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (result.data.username) {
      const usernameExists = await prisma.user.findFirst({
        where: {
          username: result.data.username,
          NOT: { id: userId },
        },
      });
      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
      updateData.username = result.data.username;
    }

    if (result.data.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: result.data.email,
          NOT: { id: userId },
        },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email already taken' },
          { status: 409 }
        );
      }
      updateData.email = result.data.email;
    }

    if (result.data.password) {
      updateData.password = await hash(result.data.password, 12);
    }

    if (result.data.name !== undefined) {
      updateData.name = result.data.name;
    }

    if (result.data.isAdmin !== undefined) {
      if (userId === session.user.id && !result.data.isAdmin) {
        return NextResponse.json(
          { error: 'Cannot remove your own admin privileges' },
          { status: 400 }
        );
      }
      updateData.isAdmin = result.data.isAdmin;
    }

    if (result.data.isActive !== undefined) {
      if (result.data.isActive && !existingUser.isActive) {
        const canActivate = await canCreateActiveUser();
        if (!canActivate) {
          return NextResponse.json(
            { error: `Cannot activate user. Maximum of ${MAX_ACTIVE_USERS} active users reached.` },
            { status: 403 }
          );
        }
      }
      updateData.isActive = result.data.isActive;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id: userId } = await params;

  if (userId === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
