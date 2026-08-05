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
  if (supabase) {
    await supabase.from('classes').insert({
      id: crypto.randomUUID(),
      ...payload
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
  const demoId = `demo-${Date.now()}`;
  const attendeesWithId = payload.attendees.map((a, i) => ({
    id: `att-${Date.now()}-${i}`,
    demo_class_id: demoId,
    student_name: a.student_name,
    student_contact: a.student_contact
  }));

  if (supabase) {
    await supabase.from('demo_classes').insert({
      id: crypto.randomUUID(),
      mentor_id: payload.mentor_id,
      start_time: payload.start_time,
      end_time: payload.end_time,
      status: 'scheduled'
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
