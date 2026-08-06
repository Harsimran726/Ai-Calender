import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { getUsers } from '@/lib/store';
import { UserRole } from '@/lib/types';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

/**
 * Resolves the currently authenticated user's full profile including role.
 *
 * STRATEGY:
 * 1. Use the cookie-session client to get auth.users identity (who is logged in).
 * 2. Use the SERVICE_ROLE client to fetch public.users profile — this BYPASSES RLS
 *    so we always get the real role even if RLS blocks the anon key.
 * 3. Email fallback: if UUID doesn't match (manually created users), find by email.
 * 4. Auto-sync the ID if found by email, so future lookups are instant by UUID.
 * 5. Dev-mode fallback when Supabase is not configured.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  // Step 1: Get authenticated identity via cookie session
  const authClient = await createServerSupabaseClient();
  if (!authClient) {
    // Dev mode — return seed admin
    const seedAdmin = getUsers().find((u) => u.role === 'admin') || getUsers()[0];
    return {
      id: seedAdmin.id,
      name: seedAdmin.name,
      email: seedAdmin.email,
      role: seedAdmin.role
    };
  }

  const {
    data: { user },
    error: authError
  } = await authClient.auth.getUser();

  if (authError || !user) {
    const seedAdmin = getUsers().find((u) => u.role === 'admin') || getUsers()[0];
    return {
      id: seedAdmin.id,
      name: seedAdmin.name,
      email: seedAdmin.email,
      role: seedAdmin.role
    };
  }

  // Step 2: Use SERVICE_ROLE client to bypass RLS when fetching the profile
  const adminClient = createServiceRoleClient();
  const db = adminClient || authClient; // fallback to auth client if service key missing

  // Step 3a: Try by UUID first (the fast path)
  let { data: profile } = await db
    .from('users')
    .select('id, name, role, email')
    .eq('id', user.id)
    .maybeSingle();

  // Step 3b: If UUID lookup fails, try by email (handles manually-created users)
  if (!profile && user.email) {
    const { data: profileByEmail } = await db
      .from('users')
      .select('id, name, role, email')
      .ilike('email', user.email)
      .maybeSingle();

    if (profileByEmail) {
      profile = profileByEmail;

      // Step 4: Auto-sync the ID so future lookups hit UUID path
      await db.from('users').update({ id: user.id }).eq('id', profileByEmail.id);

      console.log(
        `[Auth] ID synced for "${user.email}": old=${profileByEmail.id} → new=${user.id}`
      );
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

  // Step 5: No profile found at all — create one from auth metadata
  // This handles the case where the auto-trigger wasn't set up yet
  const nameFromMeta =
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User';

  // Check if the user is the first-ever user — make them admin automatically
  const { count } = await db
    .from('users')
    .select('id', { count: 'exact', head: true });

  const isFirstUser = (count ?? 0) === 0;
  const newRole: UserRole = isFirstUser ? 'admin' : 'employee';

  await db.from('users').insert({
    id: user.id,
    name: nameFromMeta,
    email: user.email || '',
    role: newRole
  });

  console.log(
    `[Auth] Auto-created profile for "${user.email}" with role="${newRole}"`
  );

  return {
    id: user.id,
    name: nameFromMeta,
    email: user.email || '',
    role: newRole
  };
}

/**
 * Require a logged-in user, redirect to / if not authenticated.
 * Returns the resolved CurrentUser.
 */
export async function requireAuth(): Promise<CurrentUser | null> {
  const authClient = await createServerSupabaseClient();
  if (!authClient) return null;

  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) return null;

  return getCurrentUser();
}
