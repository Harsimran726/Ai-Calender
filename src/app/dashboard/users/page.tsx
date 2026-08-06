import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchUsersAction } from '@/app/actions/users';
import { UsersClient } from '@/components/users/UsersClient';
import { getCurrentUser } from '@/lib/auth';

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient();
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/');
    }
  }

  const currentUser = await getCurrentUser();

  if (currentUser.role !== 'admin') {
    redirect('/dashboard');
  }

  const users = await fetchUsersAction();

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass min-h-[calc(100vh-3rem)] rounded-[28px] p-6 shadow-soft">
        <UsersClient initialUsers={users} />
      </div>
    </main>
  );
}