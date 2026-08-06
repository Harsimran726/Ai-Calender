'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import {
  getClasses,
  addClassEvent,
  getDemoClasses,
  addDemoClassEvent,
  getCourses,
  getBatches,
  getUsers,
  getTasks
} from '@/lib/store';
import { Batch } from '@/lib/types';

// ─── Fetch Events ─────────────────────────────────────────────────────────────

export async function fetchCalendarEventsAction() {
  const supabase = await createServerSupabaseClient();
  let classes = getClasses();
  let demos = getDemoClasses();
  let tasks = getTasks();

  if (supabase) {
    const { data: dbClasses } = await supabase.from('classes').select('*');
    if (dbClasses) classes = dbClasses as any;

    const { data: dbDemos } = await supabase.from('demo_classes').select('*, attendees:demo_attendees(*)');
    if (dbDemos) demos = dbDemos as any;

    const { data: dbTasks } = await supabase.from('tasks').select('*');
    if (dbTasks) tasks = dbTasks as any;
  }

  return { classes, demos, tasks };
}

// ─── Fetch Metadata (live from Supabase) ──────────────────────────────────────

export async function fetchMetadataAction() {
  const adminClient = createServiceRoleClient();

  let batches = getBatches();
  let users = getUsers();
  const courses = getCourses();

  if (adminClient) {
    // Fetch batches
    const { data: dbBatches } = await adminClient
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });
    if (dbBatches) batches = dbBatches as Batch[];

    // Fetch users — only mentor + admin roles for selectors
    const { data: dbUsers } = await adminClient
      .from('users')
      .select('id, name, email, role, profile_picture_url, created_at')
      .in('role', ['mentor', 'admin'])
      .order('role', { ascending: false }); // admin first
    if (dbUsers) users = dbUsers as any;
  }

  return { courses, batches, users };
}

// ─── Batch CRUD ───────────────────────────────────────────────────────────────

export async function fetchBatchesAction(): Promise<Batch[]> {
  const adminClient = createServiceRoleClient();
  if (!adminClient) return getBatches();

  const { data, error } = await adminClient
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return getBatches();
  return data as Batch[];
}

export async function createBatchAction(payload: {
  batch_name: string;
  start_date?: string | null;
}): Promise<{ success: boolean; error?: string; batch?: Batch }> {
  const adminClient = createServiceRoleClient();
  if (!adminClient) return { success: false, error: 'Service role not configured' };

  const { data, error } = await adminClient
    .from('batches')
    .insert({ batch_name: payload.batch_name.trim(), start_date: payload.start_date || null })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  return { success: true, batch: data as Batch };
}

export async function updateBatchAction(
  id: string,
  payload: { batch_name: string; start_date?: string | null }
): Promise<{ success: boolean; error?: string }> {
  const adminClient = createServiceRoleClient();
  if (!adminClient) return { success: false, error: 'Service role not configured' };

  const { error } = await adminClient
    .from('batches')
    .update({ batch_name: payload.batch_name.trim(), start_date: payload.start_date || null })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteBatchAction(id: string): Promise<{ success: boolean; error?: string }> {
  const adminClient = createServiceRoleClient();
  if (!adminClient) return { success: false, error: 'Service role not configured' };

  // Check if any classes reference this batch
  const { count } = await adminClient
    .from('classes')
    .select('id', { count: 'exact', head: true })
    .eq('batch_id', id);

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error: `Cannot delete: ${count} class(es) are assigned to this batch. Reassign them first.`
    };
  }

  const { error } = await adminClient.from('batches').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard');
  return { success: true };
}

// ─── Class Creation ────────────────────────────────────────────────────────────

export async function createClassAction(payload: {
  course_id: string;
  batch_id?: string | null;
  mentor_id: string;
  title: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  const classId = crypto.randomUUID();
  const sendAt = new Date(new Date(payload.start_time).getTime() - 3600000).toISOString();

  if (supabase) {
    await supabase.from('classes').insert({ id: classId, ...payload });

    await supabase.from('reminders').insert({
      id: crypto.randomUUID(),
      event_type: 'class',
      event_id: classId,
      recipient_id: payload.mentor_id,
      send_at: sendAt,
      sent: false
    });
  }

  const created = addClassEvent({ ...payload, status: 'scheduled' });
  revalidatePath('/dashboard');
  return created;
}

// ─── Demo Class Creation ───────────────────────────────────────────────────────

export async function createDemoClassAction(payload: {
  mentor_id: string;
  title: string;
  start_time: string;
  end_time: string;
  attendees: Array<{ student_name: string; student_contact?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const demoId = crypto.randomUUID();
  const sendAt = new Date(new Date(payload.start_time).getTime() - 3600000).toISOString();
  const attendeesWithId = payload.attendees.map((a, i) => ({
    id: `att-${Date.now()}-${i}`,
    demo_class_id: demoId,
    student_name: a.student_name,
    student_contact: a.student_contact
  }));

  if (supabase) {
    await supabase.from('demo_classes').insert({
      id: demoId,
      mentor_id: payload.mentor_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      status: 'scheduled'
    });

    await supabase.from('reminders').insert({
      id: crypto.randomUUID(),
      event_type: 'demo_class',
      event_id: demoId,
      recipient_id: payload.mentor_id,
      send_at: sendAt,
      sent: false
    });

    if (attendeesWithId.length > 0) {
      await supabase.from('demo_attendees').insert(attendeesWithId);
    }
  }

  const created = addDemoClassEvent({
    mentor_id: payload.mentor_id,
    title: payload.title,
    start_time: payload.start_time,
    end_time: payload.end_time,
    status: 'scheduled',
    attendees: attendeesWithId
  });

  revalidatePath('/dashboard');
  return created;
}
