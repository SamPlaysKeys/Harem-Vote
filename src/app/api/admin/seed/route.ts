import { NextResponse } from 'next/server';
import { seedAdminUser } from '@/lib/seed-admin';

export async function POST() {
  try {
    const admin = await seedAdminUser();

    if (!admin) {
      return NextResponse.json(
        { message: 'No admin credentials configured' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: 'Admin user ready',
      username: admin.username,
    });
  } catch (error) {
    console.error('Error seeding admin:', error);
    return NextResponse.json(
      { error: 'Failed to seed admin user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
