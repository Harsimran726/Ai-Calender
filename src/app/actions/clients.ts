'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getClients, addClient, updateClient, getTasks } from '@/lib/store';
import { Client, ClientStatus } from '@/lib/types';

export async function fetchClientsAction() {
  const supabase = await createServerSupabaseClient();
  let clients = getClients();

  if (supabase) {
    const { data: dbClients } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (dbClients) clients = dbClients as any;
  }

  return clients;
}

export async function createClientAction(payload: {
  name: string;
  contact?: string | null;
  company?: string | null;
  industry?: string | null;
  notes?: string | null;
  status: ClientStatus;
}) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('clients').insert({
      id: crypto.randomUUID(),
      ...payload,
      onboarding_date: new Date().toISOString().slice(0, 10)
    });
  }

  const created = addClient({
    ...payload,
    onboarding_date: new Date().toISOString().slice(0, 10)
  });

  revalidatePath('/dashboard/clients');
  return created;
}

export async function fetchClientDetailAction(clientId: string) {
  const clients = await fetchClientsAction();
  const client = clients.find((c) => c.id === clientId) || null;

  const supabase = await createServerSupabaseClient();
  let tasks = getTasks();
  if (supabase) {
    const { data: dbTasks } = await supabase.from('tasks').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
    if (dbTasks) tasks = dbTasks as any;
  }

  const clientTasks = tasks.filter((t) => t.client_id === clientId);
  return { client, clientTasks };
}
