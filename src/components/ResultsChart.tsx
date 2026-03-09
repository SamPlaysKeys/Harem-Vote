'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Result = {
  optionId: string;
  optionText: string;
  authenticatedVotes: number;
  anonymousVotes: number;
  totalVotes: number;
};

type TopicData = {
  topic: {
    id: string;
    question: string;
    status: string;
  };
  results: Result[];
  summary: {
    totalVotes: number;
    totalAuthenticated: number;
    totalAnonymous: number;
  };
};

type Props = {
  topicId: string;
};

export function ResultsChart({ topicId }: Props) {
  const [data, setData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/topics/${topicId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch {
        console.error('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [topicId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
        Failed to load results
      </div>
    );
  }

  const chartData = data.results.map((r) => ({
    name: r.optionText.length > 20 ? r.optionText.slice(0, 20) + '...' : r.optionText,
    fullName: r.optionText,
    Authenticated: r.authenticatedVotes,
    Anonymous: r.anonymousVotes,
    total: r.totalVotes,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Results
        </h3>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-zinc-100 p-4 text-center dark:bg-zinc-800">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {data.summary.totalVotes}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Total Votes
            </p>
          </div>
          <div className="rounded-lg bg-indigo-100 p-4 text-center dark:bg-indigo-900/30">
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
              {data.summary.totalAuthenticated}
            </p>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">
              Authenticated
            </p>
          </div>
          <div className="rounded-lg bg-amber-100 p-4 text-center dark:bg-amber-900/30">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {data.summary.totalAnonymous}
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Anonymous
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value, name) => [value, name]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullName || label
                }
              />
              <Legend />
              <Bar
                dataKey="Authenticated"
                stackId="votes"
                fill="#6366f1"
                name="Authenticated"
              />
              <Bar
                dataKey="Anonymous"
                stackId="votes"
                fill="#f59e0b"
                name="Anonymous"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-2">
        {data.results.map((result) => (
          <div
            key={result.optionId}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-zinc-900 dark:text-zinc-100">
              {result.optionText}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                {result.authenticatedVotes} auth
              </span>
              <span className="text-sm text-amber-600 dark:text-amber-400">
                {result.anonymousVotes} anon
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {result.totalVotes} total
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
