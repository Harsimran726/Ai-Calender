'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/?error=Email+and+password+are+required');
  }

  const supabase = await createServerSupabaseClient(await cookies());

  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect('/dashboard');
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    redirect('/?error=Email+is+required');
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
      redirect(`/?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/?sent=true');
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