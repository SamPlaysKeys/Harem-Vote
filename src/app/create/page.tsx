import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CreateTopicForm } from '@/components/CreateTopicForm';

export default async function CreatePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Create New Topic
      </h1>
      <CreateTopicForm />
    </div>
  );
}
