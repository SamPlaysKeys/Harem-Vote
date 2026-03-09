import { ActiveTopic } from '@/components/ActiveTopic';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Welcome to Harem Vote
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {session?.user
            ? 'Cast your vote on the current topic below'
            : 'Sign in to create topics, or vote anonymously'}
        </p>
      </div>

      <ActiveTopic />
    </div>
  );
}
