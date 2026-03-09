import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOrCreateAnonId } from '@/lib/anonymous';
import { z } from 'zod';

const castVoteSchema = z.object({
  topicId: z.string().min(1),
  optionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const result = castVoteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { topicId, optionId } = result.data;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: { options: true },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (topic.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Voting is closed for this topic' },
        { status: 400 }
      );
    }

    const validOption = topic.options.find((o) => o.id === optionId);
    if (!validOption) {
      return NextResponse.json(
        { error: 'Invalid option for this topic' },
        { status: 400 }
      );
    }

    const isAuthenticated = !!session?.user?.id;
    const anonId = isAuthenticated ? null : await getOrCreateAnonId();

    if (isAuthenticated) {
      const existingVote = await prisma.vote.findUnique({
        where: {
          topicId_userId: {
            topicId,
            userId: session.user.id,
          },
        },
      });

      if (existingVote) {
        return NextResponse.json(
          { error: 'You have already voted on this topic' },
          { status: 400 }
        );
      }
    } else if (anonId) {
      const existingVote = await prisma.vote.findUnique({
        where: {
          topicId_anonId: {
            topicId,
            anonId,
          },
        },
      });

      if (existingVote) {
        return NextResponse.json(
          { error: 'You have already voted on this topic' },
          { status: 400 }
        );
      }
    }

    const vote = await prisma.vote.create({
      data: {
        topicId,
        optionId,
        voterType: isAuthenticated ? 'AUTHENTICATED' : 'ANONYMOUS',
        userId: isAuthenticated ? session.user.id : null,
        anonId: isAuthenticated ? null : anonId,
      },
      include: {
        option: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Vote cast successfully',
        vote: {
          id: vote.id,
          optionId: vote.optionId,
          voterType: vote.voterType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    );
  }
}
