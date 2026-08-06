'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { UserProfile, UserRole } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function db() {
  const client = createServiceRoleClient();
  if (!client) throw new Error('Supabase service role key is not configured.');
  return client;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchUsersAction(): Promise<UserProfile[]> {
  try {
    const { data, error } = await db()
      .from('users')
      .select('id, name, email, role, profile_picture_url, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as UserProfile[]) ?? [];
  } catch (e) {
    console.error('[fetchUsersAction]', e);
    return [];
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfileAction(
  userId: string,
  updates: { name: string; email: string; profile_picture_url?: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db()
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (e: any) {
    console.error('[updateProfileAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Create User (admin only) ─────────────────────────────────────────────────

export async function createUserAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const role = (formData.get('role') as UserRole) || 'employee';

  if (!name || !email) {
    return { success: false, error: 'Name and email are required.' };
  }

  try {
    const { error } = await db()
      .from('users')
      .insert({ id: crypto.randomUUID(), name, email, role });
    if (error) throw error;
    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e: any) {
    console.error('[createUserAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Update Role ──────────────────────────────────────────────────────────────

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db()
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e: any) {
    console.error('[updateUserRoleAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Delete User ──────────────────────────────────────────────────────────────

export async function deleteUserAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db()
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (e: any) {
    console.error('[deleteUserAction]', e);
    return { success: false, error: e.message };
  }
}
