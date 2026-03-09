import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getAnonId } from '@/lib/anonymous';

export async function GET() {
  try {
    const session = await auth();
    const anonId = await getAnonId();

    const topic = await prisma.topic.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        creator: {
          select: { id: true, name: true },
        },
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!topic) {
      return NextResponse.json(null);
    }

    let hasVoted = false;

    if (session?.user?.id) {
      const existingVote = await prisma.vote.findUnique({
        where: {
          topicId_userId: {
            topicId: topic.id,
            userId: session.user.id,
          },
        },
      });
      hasVoted = !!existingVote;
    } else if (anonId) {
      const existingVote = await prisma.vote.findUnique({
        where: {
          topicId_anonId: {
            topicId: topic.id,
            anonId,
          },
        },
      });
      hasVoted = !!existingVote;
    }

    return NextResponse.json({
      ...topic,
      hasVoted,
      isCreator: session?.user?.id === topic.creatorId,
    });
  } catch (error) {
    console.error('Error fetching active topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active topic' },
      { status: 500 }
    );
  }
}
