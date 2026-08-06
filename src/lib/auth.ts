import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUsers } from '@/lib/store';
import { UserRole } from '@/lib/types';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      // 1. First try matching by Supabase Auth UUID (id = user.id)
      let { data: profile } = await supabase
        .from('users')
        .select('id, name, role, email')
        .eq('id', user.id)
        .maybeSingle();

      // 2. If not found by ID (e.g. manually created in Auth), try matching by email address
      if (!profile && user.email) {
        const { data: profileByEmail } = await supabase
          .from('users')
          .select('id, name, role, email')
          .ilike('email', user.email)
          .maybeSingle();

        if (profileByEmail) {
          profile = profileByEmail;
          // Synchronize the profile ID to match the Auth UUID for future fast lookups
          await supabase
            .from('users')
            .update({ id: user.id })
            .eq('id', profileByEmail.id);
        }
      }

      if (profile) {
        return {
          id: user.id,
          name: profile.name || user.email || 'User',
          email: profile.email || user.email || '',
          role: (profile.role as UserRole) || 'employee'
        };
      }

      // 3. Fallback: If user exists in Auth but has no row in public.users yet, create it with default or inferred role
      const fallbackRole: UserRole = user.email?.includes('admin') ? 'admin' : user.email?.includes('mentor') ? 'mentor' : 'employee';
      const fallbackName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

      await supabase.from('users').upsert({
        id: user.id,
        name: fallbackName,
        email: user.email || '',
        role: fallbackRole
      });

      return {
        id: user.id,
        name: fallbackName,
        email: user.email || '',
        role: fallbackRole
      };
    }
  }

  // Fallback for dev mode without Supabase connection
  const seedAdmin = getUsers().find((u) => u.role === 'admin') || getUsers()[0];
  return {
    id: seedAdmin.id,
    name: seedAdmin.name,
    email: seedAdmin.email,
    role: seedAdmin.role
  };
}
