import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '../env';

/**
 * Auth-aware server client (uses anon key + cookie session).
 * Used for auth operations and user-scoped queries.
 */
export async function createServerSupabaseClient(
  cookieStore?: Awaited<ReturnType<typeof cookies>>
) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const resolvedCookieStore = cookieStore ?? (await cookies());

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        for (const { name, value, options } of cookiesToSet) {
          resolvedCookieStore.set(name, value, options);
        }
      }
    }
  });
}

/**
 * Service-role admin client (bypasses RLS completely).
 * ONLY use server-side for trusted operations like resolving user profiles.
 * NEVER expose to the browser.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}