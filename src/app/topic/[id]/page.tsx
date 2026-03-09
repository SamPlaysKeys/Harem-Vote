import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ResultsChart } from '@/components/ResultsChart';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TopicPage({ params }: Props) {
  const { id } = await params;

  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      creator: {
        select: { name: true },
      },
    },
  });

  if (!topic) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/history"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          &larr; Back to History
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <span
          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
            topic.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
          }`}
        >
          {topic.status}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {topic.question}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          Created by {topic.creator.name || 'Anonymous'} on{' '}
          {new Date(topic.createdAt).toLocaleDateString()}
          {topic.closedAt && (
            <>
              {' '}
              &middot; Closed on {new Date(topic.closedAt).toLocaleDateString()}
            </>
          )}
        </p>
      </div>

      <ResultsChart topicId={topic.id} />
    </div>
  );
}
