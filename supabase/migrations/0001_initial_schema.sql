create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('admin', 'mentor', 'employee');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.client_status as enum ('active', 'inactive');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('todo', 'in_progress', 'review', 'done');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.work_type as enum ('video', 'post', 'both', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.reminder_event_type as enum ('class', 'demo_class');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.demo_outcome as enum ('converted', 'followup', 'not_interested');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'employee',
  profile_picture_url text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  batch_name text not null unique,
  start_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  company text,
  industry text,
  onboarding_date date,
  status public.client_status not null default 'active',
  created_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  batch_id uuid references public.batches(id) on delete set null,
  mentor_id uuid not null references public.users(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  recurring boolean not null default false,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_time_check check (end_time > start_time)
);

create table if not exists public.demo_classes (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.users(id) on delete restrict,
  start_time timestamptz not null,
  end_time timestamptz not null,
  outcome public.demo_outcome,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint demo_classes_time_check check (end_time > start_time)
);

create table if not exists public.demo_attendees (
  id uuid primary key default gen_random_uuid(),
  demo_class_id uuid not null references public.demo_classes(id) on delete cascade,
  student_name text not null,
  student_contact text,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  priority public.task_priority not null default 'medium',
  estimated_minutes integer not null default 0,
  actual_minutes integer not null default 0,
  work_type public.work_type not null default 'other',
  notes text,
  client_id uuid references public.clients(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  status public.task_status not null default 'todo',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_estimated_minutes_check check (estimated_minutes >= 0),
  constraint tasks_actual_minutes_check check (actual_minutes >= 0)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  event_type public.reminder_event_type not null,
  event_id uuid not null,
  recipient_id uuid not null references public.users(id) on delete cascade,
  send_at timestamptz not null,
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists classes_mentor_start_time_idx on public.classes (mentor_id, start_time);
create index if not exists demo_classes_mentor_start_time_idx on public.demo_classes (mentor_id, start_time);
create index if not exists tasks_client_status_idx on public.tasks (client_id, status);
create index if not exists reminders_send_at_sent_idx on public.reminders (send_at, sent);
create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);