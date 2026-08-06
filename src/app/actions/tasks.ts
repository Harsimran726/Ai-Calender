'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Task, TaskPriority, TaskStatus, WorkType } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function db() {
  const client = createServiceRoleClient();
  if (!client) throw new Error('Supabase service role key is not configured.');
  return client;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchTasksDataAction() {
  try {
    const supabase = db();
    // Parallel fetch for speed
    const [{ data: tasks }, { data: clients }, { data: users }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name, status'),
      supabase.from('users').select('id, name, email, role')
    ]);
    return {
      tasks: (tasks ?? []) as Task[],
      clients: clients ?? [],
      users: users ?? []
    };
  } catch (e) {
    console.error('[fetchTasksDataAction]', e);
    return { tasks: [], clients: [], users: [] };
  }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createTaskAction(payload: {
  title: string;
  priority: TaskPriority;
  estimated_minutes: number;
  work_type: WorkType;
  notes?: string | null;
  client_id?: string | null;
  assigned_to?: string | null;
  due_at?: string | null;
}): Promise<{ success: boolean; task?: Task; error?: string }> {
  try {
    const { data, error } = await db()
      .from('tasks')
      .insert({
        id: crypto.randomUUID(),
        ...payload,
        actual_minutes: 0,
        status: 'todo'
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath('/dashboard/tasks');
    return { success: true, task: data as Task };
  } catch (e: any) {
    console.error('[createTaskAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Update Status ────────────────────────────────────────────────────────────

export async function updateTaskStatusAction(
  taskId: string,
  status: TaskStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db()
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId);
    if (error) throw error;
    revalidatePath('/dashboard/tasks');
    return { success: true };
  } catch (e: any) {
    console.error('[updateTaskStatusAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Log Time ─────────────────────────────────────────────────────────────────

export async function logTaskTimeAction(
  taskId: string,
  additionalMinutes: number
): Promise<{ success: boolean; actual_minutes?: number; error?: string }> {
  try {
    const { data: current, error: fetchErr } = await db()
      .from('tasks')
      .select('actual_minutes')
      .eq('id', taskId)
      .single();

    if (fetchErr) throw fetchErr;

    const newActual = ((current?.actual_minutes as number) || 0) + additionalMinutes;

    const { error: updateErr } = await db()
      .from('tasks')
      .update({ actual_minutes: newActual, updated_at: new Date().toISOString() })
      .eq('id', taskId);

    if (updateErr) throw updateErr;
    revalidatePath('/dashboard/tasks');
    return { success: true, actual_minutes: newActual };
  } catch (e: any) {
    console.error('[logTaskTimeAction]', e);
    return { success: false, error: e.message };
  }
}
