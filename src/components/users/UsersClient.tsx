'use client';

import { useState } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { createUserAction, updateUserRoleAction, deleteUserAction } from '@/app/actions/users';
import { UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/back-button';

type UsersClientProps = {
  initialUsers: UserProfile[];
};

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg('Name and email are required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('email', email);
      formData.set('role', role);

      const result = await createUserAction(formData);
      if (!result.success) {
        setErrorMsg(result.error || 'Failed to create user.');
        return;
      }
      
      const newUser: UserProfile = {
        id: `u-${Date.now()}`,
        name,
        email,
        role,
        created_at: new Date().toISOString()
      };
      setUsers([newUser, ...users]);

      setName('');
      setEmail('');
      setRole('employee');
      setIsModalOpen(false);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    await updateUserRoleAction(userId, newRole);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setUsers(users.filter((u) => u.id !== userId));
    await deleteUserAction(userId);
  };

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Admin Control Surface</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-0.5">Users &amp; Roles</h1>
          <p className="mt-1 text-sm text-text-secondary">Provision and manage company Admins, Mentors, and Employees.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-primary-hover"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/15 shadow-soft">
        <table className="min-w-full divide-y divide-white/8 text-left text-sm">
          <thead className="bg-white/5 text-text-secondary">
            <tr>
              <th className="px-5 py-3.5 font-medium">User Name</th>
              <th className="px-5 py-3.5 font-medium">Email Address</th>
              <th className="px-5 py-3.5 font-medium">Role</th>
              <th className="px-5 py-3.5 font-medium">Joined Date</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {users.map((u) => (
              <tr key={u.id} className="transition hover:bg-white/[0.02]">
                <td className="px-5 py-4 font-medium text-text-primary">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-text-secondary">{u.email}</td>
                <td className="px-5 py-4">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium capitalize text-text-primary outline-none transition focus:border-primary"
                  >
                    <option value="admin">Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="employee">Employee</option>
                  </select>
                </td>
                <td className="px-5 py-4 text-text-secondary">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="rounded-xl p-2 text-text-secondary transition hover:bg-accent-danger/20 hover:text-accent-danger"
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[rgba(20,22,28,0.95)] p-6 shadow-glow">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <h3 className="font-display text-xl font-semibold text-text-primary">Provision New User</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-accent-danger/10 p-3 text-xs text-accent-danger">
                <AlertCircle className="h-4 w-4" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Assign Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary"
                >
                  <option value="employee">Employee (Content/Ops)</option>
                  <option value="mentor">Mentor (Classes & Demos)</option>
                  <option value="admin">Admin (Full System Control)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-glow hover:bg-primary-hover disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
