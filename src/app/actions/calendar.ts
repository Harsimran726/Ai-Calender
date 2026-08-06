'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
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

export async function fetchMetadataAction() {
  return {
    courses: getCourses(),
    batches: getBatches(),
    users: getUsers()
  };
}

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
    await supabase.from('classes').insert({
      id: classId,
      ...payload
    });

    // Queue automated T-1hr email reminder in DB
    await supabase.from('reminders').insert({
      id: crypto.randomUUID(),
      event_type: 'class',
      event_id: classId,
      recipient_id: payload.mentor_id,
      send_at: sendAt,
      sent: false
    });
  }

  const created = addClassEvent({
    ...payload,
    status: 'scheduled'
  });
  revalidatePath('/dashboard');
  return created;
}

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

    // Queue automated T-1hr email reminder in DB
    await supabase.from('reminders').insert({
      id: crypto.randomUUID(),
      event_type: 'demo_class',
      event_id: demoId,
      recipient_id: payload.mentor_id,
      send_at: sendAt,
      sent: false
    });
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
