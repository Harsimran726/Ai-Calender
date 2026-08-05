'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTasks, addTask, updateTask, getClients, getUsers } from '@/lib/store';
import { Task, TaskPriority, TaskStatus, WorkType } from '@/lib/types';

export async function fetchTasksDataAction() {
  const supabase = await createServerSupabaseClient();
  let tasks = getTasks();
  let clients = getClients();
  let users = getUsers();

  if (supabase) {
    const { data: dbTasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (dbTasks) tasks = dbTasks as any;

    const { data: dbClients } = await supabase.from('clients').select('*');
    if (dbClients) clients = dbClients as any;

    const { data: dbUsers } = await supabase.from('users').select('*');
    if (dbUsers) users = dbUsers as any;
  }

  return { tasks, clients, users };
}

export async function createTaskAction(payload: {
  title: string;
  priority: TaskPriority;
  estimated_minutes: number;
  work_type: WorkType;
  notes?: string | null;
  client_id?: string | null;
  assigned_to?: string | null;
  due_at?: string | null;
}) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('tasks').insert({
      id: crypto.randomUUID(),
      ...payload,
      actual_minutes: 0,
      status: 'todo'
    });
  }

  const created = addTask({
    ...payload,
    actual_minutes: 0,
    status: 'todo'
  });

  revalidatePath('/dashboard/tasks');
  return created;
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('tasks').update({ status }).eq('id', taskId);
  }
  updateTask(taskId, { status });
  revalidatePath('/dashboard/tasks');
  return { success: true };
}

export async function logTaskTimeAction(taskId: string, additionalMinutes: number) {
  const tasks = getTasks();
  const current = tasks.find((t) => t.id === taskId);
  const newActual = (current?.actual_minutes || 0) + additionalMinutes;

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.from('tasks').update({ actual_minutes: newActual }).eq('id', taskId);
  }

  updateTask(taskId, { actual_minutes: newActual });
  revalidatePath('/dashboard/tasks');
  return { success: true, actual_minutes: newActual };
}
