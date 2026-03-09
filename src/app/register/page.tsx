'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              pattern="[a-zA-Z0-9_]+"
              minLength={3}
              maxLength={30}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <p className="mt-1 text-xs text-zinc-500">
              At least 8 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
