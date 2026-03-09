import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const topics = await prisma.topic.findMany({
    include: {
      creator: {
        select: { name: true },
      },
      _count: {
        select: { votes: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Voting History
      </h1>

      {topics.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No topics created yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="block rounded-lg border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      topic.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {topic.status}
                  </span>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {topic.question}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
                    Created by {topic.creator.name || 'Anonymous'} &middot;{' '}
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {topic._count.votes}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500">
                    vote{topic._count.votes !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
