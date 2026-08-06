'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Batch, ClassEvent, DemoClassEvent, Task } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function db() {
  const client = createServiceRoleClient();
  if (!client) throw new Error('Supabase service role key is not configured.');
  return client;
}

// Default fallback courses to ensure FK constraints and select dropdowns never fail
const DEFAULT_COURSES = [
  { id: 'c-1', name: 'Full-Stack React & Next.js Masterclass', description: 'Next.js App Router & Server Components' },
  { id: 'c-2', name: 'AI Engineering & Agentic Systems', description: 'LLM Architectures & Autonomous Agents' }
];

// ─── Fetch Calendar Events ───────────────────────────────────────────────────

export async function fetchCalendarEventsAction() {
  try {
    const supabase = db();
    const [{ data: classes, error: classErr }, { data: demos, error: demoErr }, { data: tasks, error: taskErr }] = await Promise.all([
      supabase.from('classes').select('*').order('start_time', { ascending: true }),
      supabase.from('demo_classes').select('*, attendees:demo_attendees(*)').order('start_time', { ascending: true }),
      supabase.from('tasks').select('*').order('due_at', { ascending: true })
    ]);

    if (classErr) console.warn('[fetchCalendarEventsAction] classes fetch error:', classErr.message);
    if (demoErr) console.warn('[fetchCalendarEventsAction] demos fetch error:', demoErr.message);
    if (taskErr) console.warn('[fetchCalendarEventsAction] tasks fetch error:', taskErr.message);

    // Map rows cleanly — synthesize title if DB table lacks title column
    const formattedClasses: ClassEvent[] = (classes ?? []).map((c: any) => ({
      id: c.id,
      course_id: c.course_id,
      batch_id: c.batch_id ?? null,
      mentor_id: c.mentor_id,
      title: c.title || 'Batch Class',
      start_time: c.start_time,
      end_time: c.end_time,
      recurring: Boolean(c.recurring),
      status: c.status || 'scheduled',
      created_at: c.created_at
    }));

    const formattedDemos: DemoClassEvent[] = (demos ?? []).map((d: any) => ({
      id: d.id,
      mentor_id: d.mentor_id,
      title: d.title || 'Demo Class',
      start_time: d.start_time,
      end_time: d.end_time,
      outcome: d.outcome ?? null,
      status: d.status || 'scheduled',
      attendees: d.attendees ?? [],
      created_at: d.created_at
    }));

    return {
      classes: formattedClasses,
      demos: formattedDemos,
      tasks: (tasks ?? []) as Task[]
    };
  } catch (e) {
    console.error('[fetchCalendarEventsAction] Error:', e);
    return { classes: [], demos: [], tasks: [] };
  }
}

// ─── Fetch Metadata ───────────────────────────────────────────────────────────

export async function fetchMetadataAction() {
  try {
    const supabase = db();
    const [{ data: batches }, { data: users }, { data: dbCourses }] = await Promise.all([
      supabase.from('batches').select('*').order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('id, name, email, role, profile_picture_url, created_at')
        .in('role', ['mentor', 'admin'])
        .order('role', { ascending: false }),
      supabase.from('courses').select('id, name, description').order('name', { ascending: true })
    ]);

    let finalCourses = dbCourses ?? [];

    // Auto-seed default courses if public.courses table is empty
    if (finalCourses.length === 0) {
      console.log('[fetchMetadataAction] Seeding default courses into public.courses...');
      const { data: insertedCourses } = await supabase
        .from('courses')
        .insert(DEFAULT_COURSES)
        .select();
      finalCourses = insertedCourses ?? DEFAULT_COURSES;
    }

    return {
      courses: finalCourses,
      batches: (batches ?? []) as Batch[],
      users: (users ?? []) as any[]
    };
  } catch (e) {
    console.error('[fetchMetadataAction] Error:', e);
    return { courses: DEFAULT_COURSES, batches: [], users: [] };
  }
}

// ─── Batch CRUD ───────────────────────────────────────────────────────────────

export async function fetchBatchesAction(): Promise<Batch[]> {
  try {
    const { data, error } = await db()
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Batch[]) ?? [];
  } catch (e) {
    console.error('[fetchBatchesAction]', e);
    return [];
  }
}

export async function createBatchAction(payload: {
  batch_name: string;
  start_date?: string | null;
}): Promise<{ success: boolean; error?: string; batch?: Batch }> {
  try {
    const { data, error } = await db()
      .from('batches')
      .insert({ batch_name: payload.batch_name.trim(), start_date: payload.start_date || null })
      .select()
      .single();
    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true, batch: data as Batch };
  } catch (e: any) {
    console.error('[createBatchAction]', e);
    return { success: false, error: e.message };
  }
}

export async function updateBatchAction(
  id: string,
  payload: { batch_name: string; start_date?: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await db()
      .from('batches')
      .update({ batch_name: payload.batch_name.trim(), start_date: payload.start_date || null })
      .eq('id', id);
    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    console.error('[updateBatchAction]', e);
    return { success: false, error: e.message };
  }
}

export async function deleteBatchAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { count } = await db()
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .eq('batch_id', id);

    if ((count ?? 0) > 0) {
      return {
        success: false,
        error: `Cannot delete: ${count} class(es) are assigned to this batch. Reassign them first.`
      };
    }

    const { error } = await db().from('batches').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    console.error('[deleteBatchAction]', e);
    return { success: false, error: e.message };
  }
}

// ─── Create Class (Resilient with Schema Fallback) ───────────────────────────

export async function createClassAction(payload: {
  course_id: string;
  batch_id?: string | null;
  mentor_id: string;
  title: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
}): Promise<ClassEvent> {
  const supabase = db();
  const classId = crypto.randomUUID();
  const sendAt = new Date(new Date(payload.start_time).getTime() - 3_600_000).toISOString();

  // Validate course_id
  let courseIdToUse = payload.course_id;
  if (!courseIdToUse) {
    const { courses } = await fetchMetadataAction();
    courseIdToUse = courses[0]?.id || DEFAULT_COURSES[0].id;
  }

  // Ensure course exists in DB to prevent foreign key violation
  const { data: courseCheck } = await supabase.from('courses').select('id').eq('id', courseIdToUse).maybeSingle();
  if (!courseCheck) {
    console.log(`[createClassAction] Course ID ${courseIdToUse} not found in DB. Inserting default course...`);
    await supabase.from('courses').upsert(DEFAULT_COURSES[0]);
    courseIdToUse = DEFAULT_COURSES[0].id;
  }

  const insertPayload: any = {
    id: classId,
    course_id: courseIdToUse,
    batch_id: payload.batch_id || null,
    mentor_id: payload.mentor_id,
    title: payload.title.trim() || 'New Class',
    start_time: payload.start_time,
    end_time: payload.end_time,
    recurring: Boolean(payload.recurring),
    status: 'scheduled'
  };

  // Step 1: Try inserting with all fields
  let { data, error } = await supabase
    .from('classes')
    .insert(insertPayload)
    .select()
    .maybeSingle();

  // Step 2: Fallback if DB table lacks `title` column
  if (error && (error.message.includes('title') || error.message.includes('schema cache'))) {
    console.warn('[createClassAction] Title column missing in DB schema cache. Retrying without title column...');
    const { title, ...payloadNoTitle } = insertPayload;
    const retry = await supabase
      .from('classes')
      .insert(payloadNoTitle)
      .select()
      .single();

    if (retry.error) {
      throw new Error(`Failed to create class: ${retry.error.message}`);
    }
    data = { ...retry.data, title: payload.title };
  } else if (error) {
    throw new Error(`Failed to create class: ${error.message}`);
  }

  // Step 3: Queue T-1hr reminder (best effort)
  try {
    await supabase.from('reminders').insert({
      id: crypto.randomUUID(),
      event_type: 'class',
      event_id: classId,
      recipient_id: payload.mentor_id,
      send_at: sendAt,
      sent: false
    });
  } catch (remErr) {
    console.warn('[createClassAction] Reminder insertion warning:', remErr);
  }

  revalidatePath('/dashboard');
  return (data || { ...insertPayload, status: 'scheduled' }) as ClassEvent;
}

// ─── Create Demo Class (Resilient with Schema Fallback) ───────────────────────

export async function createDemoClassAction(payload: {
  mentor_id: string;
  title: string;
  start_time: string;
  end_time: string;
  attendees: Array<{ student_name: string; student_contact?: string }>;
}): Promise<DemoClassEvent> {
  const supabase = db();
  const demoId = crypto.randomUUID();
  const sendAt = new Date(new Date(payload.start_time).getTime() - 3_600_000).toISOString();

  const insertPayload: any = {
    id: demoId,
    mentor_id: payload.mentor_id,
    title: payload.title.trim() || 'Demo Class',
    start_time: payload.start_time,
    end_time: payload.end_time,
    status: 'scheduled'
  };

  let { data, error } = await supabase
    .from('demo_classes')
    .insert(insertPayload)
    .select()
    .maybeSingle();

  if (error && (error.message.includes('title') || error.message.includes('schema cache'))) {
    console.warn('[createDemoClassAction] Title column missing in demo_classes schema. Retrying without title...');
    const { title, ...payloadNoTitle } = insertPayload;
    const retry = await supabase
      .from('demo_classes')
      .insert(payloadNoTitle)
      .select()
      .single();

    if (retry.error) throw new Error(`Failed to create demo: ${retry.error.message}`);
    data = { ...retry.data, title: payload.title };
  } else if (error) {
    throw new Error(`Failed to create demo: ${error.message}`);
  }

  // Insert attendees
  if (payload.attendees.length > 0) {
    try {
      await supabase.from('demo_attendees').insert(
        payload.attendees.map((a, i) => ({
          id: crypto.randomUUID(),
          demo_class_id: demoId,
          student_name: a.student_name,
          student_contact: a.student_contact ?? null
        }))
      );
    } catch (attErr) {
      console.warn('[createDemoClassAction] Attendees insertion warning:', attErr);
    }
  }

  // Queue T-1hr reminder
  try {
    await supabase.from('reminders').insert({
      id: crypto.randomUUID(),
      event_type: 'demo_class',
      event_id: demoId,
      recipient_id: payload.mentor_id,
      send_at: sendAt,
      sent: false
    });
  } catch (remErr) {
    console.warn('[createDemoClassAction] Reminder insertion warning:', remErr);
  }

  revalidatePath('/dashboard');
  return {
    ...(data as DemoClassEvent),
    title: payload.title || 'Demo Class',
    attendees: payload.attendees.map((a, i) => ({
      id: `att-${i}`,
      demo_class_id: demoId,
      student_name: a.student_name,
      student_contact: a.student_contact
    }))
  };
}
