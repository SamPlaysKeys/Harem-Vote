'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { VotingCard } from './VotingCard';
import { ResultsChart } from './ResultsChart';
import Link from 'next/link';

type Option = {
  id: string;
  text: string;
  _count: { votes: number };
};

type Topic = {
  id: string;
  question: string;
  status: 'ACTIVE' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  creator: { id: string; name: string | null };
  options: Option[];
  hasVoted: boolean;
  isCreator: boolean;
  _count: { votes: number };
};

export function ActiveTopic() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopic = async () => {
    try {
      const res = await fetch('/api/topics/active');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTopic(data);
    } catch {
      setError('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
  }, []);

  const handleVoteSuccess = () => {
    fetchTopic();
  };

  const handleCloseTopic = async () => {
    if (!topic) return;

    try {
      const res = await fetch(`/api/topics/${topic.id}/close`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to close topic');
      }

      fetchTopic();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close topic');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          No Active Topic
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {session?.user
            ? 'Create a new topic to get started!'
            : 'Sign in to create a new voting topic.'}
        </p>
        {session?.user && (
          <Link
            href="/create"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Create Topic
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between">
          <div>
            <span
              className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                topic.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {topic.status}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {topic.question}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
              Created by {topic.creator.name || 'Anonymous'} &middot;{' '}
              {topic._count.votes} vote{topic._count.votes !== 1 ? 's' : ''}
            </p>
          </div>

          {topic.isCreator && topic.status === 'ACTIVE' && (
            <button
              onClick={handleCloseTopic}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Close Voting
            </button>
          )}
        </div>
      </div>

      {topic.status === 'ACTIVE' && !topic.hasVoted ? (
        <VotingCard topic={topic} onVoteSuccess={handleVoteSuccess} />
      ) : (
        <ResultsChart topicId={topic.id} />
      )}

      {topic.hasVoted && topic.status === 'ACTIVE' && (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          You have already voted. Results will be fully visible when voting
          closes.
        </p>
      )}
    </div>
  );
}
