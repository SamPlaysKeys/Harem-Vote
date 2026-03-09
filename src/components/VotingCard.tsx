'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

type Option = {
  id: string;
  text: string;
};

type Topic = {
  id: string;
  question: string;
  options: Option[];
};

type Props = {
  topic: Topic;
  onVoteSuccess: () => void;
};

export function VotingCard({ topic, onVoteSuccess }: Props) {
  const { data: session } = useSession();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.id,
          optionId: selectedOption,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cast vote');
      }

      onVoteSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Cast Your Vote
        </h3>

        {!session?.user && (
          <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            You are voting anonymously. Sign in to have your vote counted as
            authenticated.
          </p>
        )}

        <div className="space-y-3">
          {topic.options.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center rounded-lg border p-4 transition-colors ${
                selectedOption === option.id
                  ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-900/20'
                  : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
              }`}
            >
              <input
                type="radio"
                name="vote"
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-3 text-zinc-900 dark:text-zinc-100">
                {option.text}
              </span>
            </label>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!selectedOption || submitting}
        className="w-full rounded-lg bg-indigo-600 py-3 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Vote'}
      </button>
    </form>
  );
}
