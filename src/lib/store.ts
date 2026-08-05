import {
  UserProfile,
  Course,
  Batch,
  ClassEvent,
  DemoClassEvent,
  Task,
  Client,
  ActivityLog,
  Reminder
} from './types';

// Seed initial users (Admin, Mentor, Employee)
let usersStore: UserProfile[] = [
  {
    id: 'u-admin-1',
    name: 'Harsimran Singh (Admin)',
    email: 'admin@company.com',
    role: 'admin',
    created_at: new Date('2026-08-01T10:00:00Z').toISOString()
  },
  {
    id: 'u-mentor-1',
    name: 'Dr. Sarah Connor (Mentor)',
    email: 'sarah.mentor@company.com',
    role: 'mentor',
    created_at: new Date('2026-08-02T11:00:00Z').toISOString()
  },
  {
    id: 'u-mentor-2',
    name: 'Alex Rivera (Mentor)',
    email: 'alex.mentor@company.com',
    role: 'mentor',
    created_at: new Date('2026-08-02T12:00:00Z').toISOString()
  },
  {
    id: 'u-employee-1',
    name: 'Jordan Lee (Content Creator)',
    email: 'jordan.emp@company.com',
    role: 'employee',
    created_at: new Date('2026-08-03T09:00:00Z').toISOString()
  }
];

let coursesStore: Course[] = [
  { id: 'c-1', name: 'Full-Stack React & Next.js Masterclass', description: 'Comprehensive Next.js App Router & Server Components' },
  { id: 'c-2', name: 'AI Engineering & Agentic Systems', description: 'LLM Architectures, RAG, and Autonomous Coding Agents' }
];

let batchesStore: Batch[] = [
  { id: 'b-1', batch_name: 'Cohort Alpha 2026', start_date: '2026-08-01' },
  { id: 'b-2', batch_name: 'Cohort Beta 2026', start_date: '2026-08-15' }
];

let classesStore: ClassEvent[] = [
  {
    id: 'cls-1',
    course_id: 'c-1',
    batch_id: 'b-1',
    mentor_id: 'u-mentor-1',
    title: 'Next.js App Router Architecture & State',
    start_time: new Date(Date.now() + 1000 * 60 * 120).toISOString(), // 2 hours from now
    end_time: new Date(Date.now() + 1000 * 60 * 240).toISOString(),
    recurring: true,
    status: 'scheduled',
    created_at: new Date().toISOString()
  }
];

let demoClassesStore: DemoClassEvent[] = [
  {
    id: 'demo-1',
    mentor_id: 'u-mentor-2',
    title: 'Intro to Agentic AI Systems (Demo Class)',
    start_time: new Date(Date.now() + 1000 * 60 * 360).toISOString(), // 6 hours from now
    end_time: new Date(Date.now() + 1000 * 60 * 420).toISOString(),
    outcome: null,
    status: 'scheduled',
    attendees: [
      { id: 'att-1', demo_class_id: 'demo-1', student_name: 'Michael Scott', student_contact: 'michael@dunder.com' },
      { id: 'att-2', demo_class_id: 'demo-1', student_name: 'Pam Beesly', student_contact: 'pam@dunder.com' }
    ],
    created_at: new Date().toISOString()
  }
];

let clientsStore: Client[] = [
  {
    id: 'cli-1',
    name: 'Acme Dynamics',
    company: 'Acme Corp',
    contact: 'contact@acmedynamics.io',
    industry: 'Enterprise Software',
    onboarding_date: '2026-07-15',
    status: 'active',
    notes: 'Key client for video production & calendar integrations.',
    created_at: new Date().toISOString()
  },
  {
    id: 'cli-2',
    name: 'Starlight Tech',
    company: 'Starlight Inc',
    contact: 'hello@starlight.ai',
    industry: 'Artificial Intelligence',
    onboarding_date: '2026-08-01',
    status: 'active',
    notes: 'Weekly content batch and course promo reels.',
    created_at: new Date().toISOString()
  }
];

let tasksStore: Task[] = [
  {
    id: 'task-1',
    title: 'Edit Launch Reel for Next.js Course',
    priority: 'high',
    estimated_minutes: 180,
    actual_minutes: 90,
    work_type: 'video',
    notes: 'Needs color grading, background audio, and subtitling.',
    client_id: 'cli-1',
    assigned_to: 'u-employee-1',
    status: 'in_progress',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Design Social Media Banner Post',
    priority: 'medium',
    estimated_minutes: 60,
    actual_minutes: 45,
    work_type: 'post',
    notes: 'Banner for Cohort Beta announcement.',
    client_id: 'cli-2',
    assigned_to: 'u-employee-1',
    status: 'todo',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    created_at: new Date().toISOString()
  }
];

let activityLogsStore: ActivityLog[] = [
  {
    id: 'log-1',
    actor_id: 'u-admin-1',
    actor_name: 'Harsimran Singh (Admin)',
    action: 'System Initialized',
    entity_type: 'system',
    metadata: { version: '1.0.0' },
    created_at: new Date().toISOString()
  }
];

let remindersStore: Reminder[] = [
  {
    id: 'rem-1',
    event_type: 'class',
    event_id: 'cls-1',
    recipient_id: 'u-mentor-1',
    send_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    sent: false,
    created_at: new Date().toISOString()
  }
];

// Helper functions for Store
export function getUsers(): UserProfile[] {
  return usersStore;
}

export function addUser(user: Omit<UserProfile, 'id' | 'created_at'>): UserProfile {
  const newUser: UserProfile = {
    ...user,
    id: `u-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  usersStore.unshift(newUser);
  addActivityLog('System/Admin', 'Created User', 'users', newUser.id, { name: newUser.name, role: newUser.role });
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
  const idx = usersStore.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  usersStore[idx] = { ...usersStore[idx], ...updates };
  addActivityLog('System/Admin', 'Updated User Profile', 'users', id, updates);
  return usersStore[idx];
}

export function deleteUser(id: string): boolean {
  const initialLen = usersStore.length;
  usersStore = usersStore.filter((u) => u.id !== id);
  if (usersStore.length < initialLen) {
    addActivityLog('System/Admin', 'Deleted User', 'users', id);
    return true;
  }
  return false;
}

export function getCourses(): Course[] {
  return coursesStore;
}

export function getBatches(): Batch[] {
  return batchesStore;
}

export function getClasses(): ClassEvent[] {
  return classesStore;
}

export function addClassEvent(event: Omit<ClassEvent, 'id' | 'created_at'>): ClassEvent {
  const newClass: ClassEvent = {
    ...event,
    id: `cls-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  classesStore.unshift(newClass);

  // Auto-schedule reminder T-1hr
  const sendAt = new Date(new Date(event.start_time).getTime() - 1000 * 60 * 60).toISOString();
  remindersStore.push({
    id: `rem-${Date.now()}`,
    event_type: 'class',
    event_id: newClass.id,
    recipient_id: newClass.mentor_id,
    send_at: sendAt,
    sent: false,
    created_at: new Date().toISOString()
  });

  addActivityLog('Admin/User', 'Created Class Event', 'classes', newClass.id, { title: newClass.title });
  return newClass;
}

export function getDemoClasses(): DemoClassEvent[] {
  return demoClassesStore;
}

export function addDemoClassEvent(event: Omit<DemoClassEvent, 'id' | 'created_at'>): DemoClassEvent {
  const newDemo: DemoClassEvent = {
    ...event,
    id: `demo-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  demoClassesStore.unshift(newDemo);

  const sendAt = new Date(new Date(event.start_time).getTime() - 1000 * 60 * 60).toISOString();
  remindersStore.push({
    id: `rem-${Date.now()}`,
    event_type: 'demo_class',
    event_id: newDemo.id,
    recipient_id: newDemo.mentor_id,
    send_at: sendAt,
    sent: false,
    created_at: new Date().toISOString()
  });

  addActivityLog('Admin/User', 'Created Demo Class Event', 'demo_classes', newDemo.id, { title: newDemo.title });
  return newDemo;
}

export function getTasks(): Task[] {
  return tasksStore;
}

export function addTask(task: Omit<Task, 'id' | 'created_at'>): Task {
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  tasksStore.unshift(newTask);
  addActivityLog('User', 'Created Task', 'tasks', newTask.id, { title: newTask.title });
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const idx = tasksStore.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasksStore[idx] = { ...tasksStore[idx], ...updates };
  addActivityLog('User', 'Updated Task', 'tasks', id, updates);
  return tasksStore[idx];
}

export function getClients(): Client[] {
  return clientsStore;
}

export function addClient(client: Omit<Client, 'id' | 'created_at'>): Client {
  const newClient: Client = {
    ...client,
    id: `cli-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  clientsStore.unshift(newClient);
  addActivityLog('Admin', 'Added Client', 'clients', newClient.id, { name: newClient.name });
  return newClient;
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const idx = clientsStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clientsStore[idx] = { ...clientsStore[idx], ...updates };
  addActivityLog('Admin', 'Updated Client', 'clients', id, updates);
  return clientsStore[idx];
}

export function getActivityLogs(): ActivityLog[] {
  return activityLogsStore;
}

export function addActivityLog(actor_name: string, action: string, entity_type: string, entity_id?: string, metadata?: Record<string, unknown>): ActivityLog {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actor_name,
    action,
    entity_type,
    entity_id,
    metadata,
    created_at: new Date().toISOString()
  };
  activityLogsStore.unshift(log);
  return log;
}

export function getReminders(): Reminder[] {
  return remindersStore;
}
