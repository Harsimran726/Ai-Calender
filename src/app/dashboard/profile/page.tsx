import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUsers } from '@/lib/store';
import { ProfileClient } from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  let userProfile = getUsers()[0];

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/');
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
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
