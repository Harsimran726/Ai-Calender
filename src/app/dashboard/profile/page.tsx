import { redirect } from 'next/navigation';
import { ProfileClient } from '@/components/profile/ProfileClient';
import { requireAuth } from '@/lib/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getUsers } from '@/lib/store';

export default async function ProfilePage() {
  const currentUser = await requireAuth();
  if (!currentUser) redirect('/');

  // Fetch full profile row via service role client (bypasses RLS)
  const adminClient = createServiceRoleClient();
  let userProfile = getUsers()[0];

  if (adminClient) {
    const { data: profile } = await adminClient
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();
    if (profile) {
      userProfile = profile;
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="glass min-h-[calc(100vh-3rem)] rounded-[28px] p-6 shadow-soft max-w-3xl mx-auto">
        <ProfileClient initialProfile={userProfile} />
      </div>
    </main>
  );
}
