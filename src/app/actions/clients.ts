'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Client, ClientStatus } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function db() {
  const client = createServiceRoleClient();
  if (!client) throw new Error('Supabase service role key is not configured.');
  return client;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchClientsAction(): Promise<Client[]> {
  try {
    const { data, error } = await db()
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Client[]) ?? [];
  } catch (e) {
    console.error('[fetchClientsAction]', e);
    return [];
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createClientAction(payload: {
  name: string;
  contact?: string | null;
  company?: string | null;
  industry?: string | null;
  notes?: string | null;
  status: ClientStatus;
}): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const { data, error } = await db()
      .from('clients')
      .insert({
        id: crypto.randomUUID(),
        ...payload,
        onboarding_date: new Date().toISOString().slice(0, 10)
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/dashboard/clients');
    return { success: true, client: data as Client };
  } catch (e: any) {
    console.error('[createClientAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateClientAction(
  clientId: string,
  payload: Partial<Pick<Client, 'name' | 'contact' | 'company' | 'industry' | 'notes' | 'status'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db()
      .from('clients')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', clientId);
    if (error) throw error;
    revalidatePath('/dashboard/clients');
    return { success: true };
  } catch (e: any) {
    console.error('[updateClientAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Client Detail (with tasks) ───────────────────────────────────────────────

export async function fetchClientDetailAction(clientId: string) {
  try {
    const supabase = db();
    const [{ data: client }, { data: tasks }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', clientId).maybeSingle(),
      supabase.from('tasks').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    ]);
    return { client: client as Client | null, clientTasks: tasks ?? [] };
  } catch (e) {
    console.error('[fetchClientDetailAction]', e);
    return { client: null, clientTasks: [] };
  }
}
