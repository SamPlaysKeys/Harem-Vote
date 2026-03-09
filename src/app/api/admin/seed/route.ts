import { NextRequest, NextResponse } from 'next/server';
import { seedAdminUser } from '@/lib/seed-admin';

async function handleSeed(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset') === 'true';

    const result = await seedAdminUser(reset);

    if (result.action === 'skipped') {
      return NextResponse.json(
        { message: 'No admin credentials configured' },
        { status: 200 }
      );
    }

    const messages = {
      created: 'Admin user created',
      exists: 'Admin user already exists',
      reset: 'Admin password reset successfully',
    };

    return NextResponse.json({
      message: messages[result.action],
      username: result.user?.username,
      action: result.action,
    });
  } catch (error) {
    console.error('Error seeding admin:', error);
    return NextResponse.json(
      { error: 'Failed to seed admin user' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleSeed(request);
}

export async function GET(request: NextRequest) {
  return handleSeed(request);
}
