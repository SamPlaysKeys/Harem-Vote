import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: topicId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        creator: true,
        options: true,
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    if (topic.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the topic creator can close voting' },
        { status: 403 }
      );
    }

    if (topic.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Topic is already closed' },
        { status: 400 }
      );
    }

    const votes = await prisma.vote.findMany({
      where: { topicId },
      include: { option: true },
    });

    const results = topic.options.map((option) => {
      const optionVotes = votes.filter((v) => v.optionId === option.id);
      const authenticatedVotes = optionVotes.filter(
        (v) => v.voterType === 'AUTHENTICATED'
      ).length;
      const anonymousVotes = optionVotes.filter(
        (v) => v.voterType === 'ANONYMOUS'
      ).length;

      return {
        optionId: option.id,
        optionText: option.text,
        authenticatedVotes,
        anonymousVotes,
        totalVotes: authenticatedVotes + anonymousVotes,
      };
    });

    const totalVotes = votes.length;
    const totalAuthenticated = votes.filter(
      (v) => v.voterType === 'AUTHENTICATED'
    ).length;
    const totalAnonymous = votes.filter(
      (v) => v.voterType === 'ANONYMOUS'
    ).length;

    const closedTopic = await prisma.topic.update({
      where: { id: topicId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: {
        options: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // TODO: Send email notification (Phase 5)
    // await sendResultsEmail(closedTopic, results);

    return NextResponse.json({
      topic: closedTopic,
      results,
      summary: {
        totalVotes,
        totalAuthenticated,
        totalAnonymous,
      },
    });
  } catch (error) {
    console.error('Error closing topic:', error);
    return NextResponse.json(
      { error: 'Failed to close topic' },
      { status: 500 }
    );
  }
}
