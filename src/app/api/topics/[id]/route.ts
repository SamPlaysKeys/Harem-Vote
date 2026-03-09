import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: topicId } = await params;

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        options: true,
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const votes = await prisma.vote.findMany({
      where: { topicId },
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

    return NextResponse.json({
      topic,
      results,
      summary: {
        totalVotes,
        totalAuthenticated,
        totalAnonymous,
      },
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}
