import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchCalendarEventsAction, fetchMetadataAction } from '@/app/actions/calendar';
import { getUsers } from '@/lib/store';
import { CalendarView } from '@/components/calendar/CalendarView';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  let userName = 'Harsimran Singh (Admin)';
  let userRole: 'admin' | 'mentor' | 'employee' = 'admin';

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/');
    }

    const { data: profile } = await supabase
      .from('users')
      .select('name, role, email')
      .eq('id', user.id)
      .maybeSingle();

    userName = profile?.name ?? user.email ?? 'User';
    userRole = profile?.role ?? 'employee';
  } else {
    const seedAdmin = getUsers().find((u) => u.role === 'admin');
    if (seedAdmin) {
      userName = seedAdmin.name;
      userRole = seedAdmin.role;
    }
  }

  const { classes, demos, tasks } = await fetchCalendarEventsAction();
  const { courses, batches, users } = await fetchMetadataAction();

  return (
    <AppShell userName={userName} userRole={userRole}>
      <CalendarView
        initialClasses={classes}
        initialDemos={demos}
        initialTasks={tasks}
        courses={courses}
        batches={batches}
        users={users}
        userRole={userRole}
      />
    </AppShell>
  );
}
