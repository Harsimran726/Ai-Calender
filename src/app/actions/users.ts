'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUsers, addUser, updateUser, deleteUser as deleteUserFromStore } from '@/lib/store';
import { UserRole } from '@/lib/types';

export async function updateProfileAction(
  userId: string,
  updates: { name: string; email: string; profile_picture_url?: string | null }
) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('users').update(updates).eq('id', userId);
  }
  const updated = updateUser(userId, updates);
  revalidatePath('/dashboard/profile');
  return updated;
}

export async function fetchUsersAction() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data;
    }
  }
  return getUsers();
}

export async function createUserAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const role = (formData.get('role') as UserRole) || 'employee';

  if (!name || !email) {
    throw new Error('Name and email are required.');
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    // In Supabase, if auth admin service key is available, we could create auth user, or insert to users table
    const { error } = await supabase.from('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      role
    });
    if (error) {
      console.warn('Supabase insert error, falling back to store:', error.message);
      addUser({ name, email, role });
    }
  } else {
    addUser({ name, email, role });
  }

  revalidatePath('/dashboard/users');
  return { success: true };
}

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('users').update({ role: newRole }).eq('id', userId);
  }
  updateUser(userId, { role: newRole });
  revalidatePath('/dashboard/users');
  return { success: true };
}

export async function deleteUserAction(userId: string) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('users').delete().eq('id', userId);
  }
  deleteUserFromStore(userId);
  revalidatePath('/dashboard/users');
  return { success: true };
}
