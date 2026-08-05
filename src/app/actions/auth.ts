'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const supabase = await createServerSupabaseClient(await cookies());

  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
  }

  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient(await cookies());
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/');
}