import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { UserManagement } from '@/components/UserManagement';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.isAdmin) {
    redirect('/');
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        User Management
      </h1>
      <UserManagement />
    </div>
  );
}
