'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    throw new Error('Email is required.');
  }

  const supabase = await createServerSupabaseClient(await cookies());

  if (supabase) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/dashboard`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect('/?sent=true');
  }

  // Fallback for dev mode when Supabase env keys are not present
  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient(await cookies());
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/');
}