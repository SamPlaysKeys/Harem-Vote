'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  username: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    topics: number;
    votes: number;
  };
};

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
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
      <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Create User
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Activity
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name || user.username}
                    </p>
                    <p className="text-sm text-zinc-500">@{user.username}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      user.isAdmin
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {user._count.topics} topics, {user._count.votes} votes
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user)}
                      className="text-sm text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                      {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.username)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateForm && (
        <CreateUserModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchUsers();
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    isAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength={8}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) =>
                setFormData({ ...formData, isAdmin: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              Admin privileges
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    name: user.name || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const updateData: Record<string, string> = {};
    if (formData.username !== user.username)
      updateData.username = formData.username;
    if (formData.email !== user.email) updateData.email = formData.email;
    if (formData.name !== (user.name || '')) updateData.name = formData.name;
    if (formData.password) updateData.password = formData.password;

    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Edit User: {user.username}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="password"
            placeholder="New password (leave blank to keep)"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            minLength={8}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
