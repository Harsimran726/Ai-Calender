export type UserRole = 'admin' | 'mentor' | 'employee';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile_picture_url?: string | null;
  created_at?: string;
};

export type Course = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
};

export type Batch = {
  id: string;
  batch_name: string;
  start_date?: string;
  created_at?: string;
};

export type ClassEvent = {
  id: string;
  course_id: string;
  batch_id?: string | null;
  mentor_id: string;
  title: string;
  start_time: string;
  end_time: string;
  recurring: boolean;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at?: string;
};

export type DemoAttendee = {
  id: string;
  demo_class_id: string;
  student_name: string;
  student_contact?: string;
};

export type DemoOutcome = 'converted' | 'followup' | 'not_interested';

export type DemoClassEvent = {
  id: string;
  mentor_id: string;
  title: string;
  start_time: string;
  end_time: string;
  outcome?: DemoOutcome | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  attendees: DemoAttendee[];
  created_at?: string;
};

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type WorkType = 'video' | 'post' | 'both' | 'other';

export type Task = {
  id: string;
  title: string;
  priority: TaskPriority;
  estimated_minutes: number;
  actual_minutes: number;
  work_type: WorkType;
  notes?: string | null;
  client_id?: string | null;
  assigned_to?: string | null;
  status: TaskStatus;
  due_at?: string | null;
  created_at?: string;
};

export type ClientStatus = 'active' | 'inactive';

export type Client = {
  id: string;
  name: string;
  contact?: string | null;
  company?: string | null;
  industry?: string | null;
  onboarding_date?: string | null;
  status: ClientStatus;
  created_by?: string | null;
  notes?: string | null;
  created_at?: string;
};

export type ActivityLog = {
  id: string;
  actor_id?: string | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type Reminder = {
  id: string;
  event_type: 'class' | 'demo_class';
  event_id: string;
  recipient_id: string;
  send_at: string;
  sent: boolean;
  created_at: string;
};
