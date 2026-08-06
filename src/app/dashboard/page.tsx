import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { fetchCalendarEventsAction, fetchMetadataAction } from '@/app/actions/calendar';
import { CalendarView } from '@/components/calendar/CalendarView';
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const currentUser = await requireAuth();
  if (!currentUser) redirect('/');

  const { classes, demos, tasks } = await fetchCalendarEventsAction();
  const { courses, batches, users } = await fetchMetadataAction();

  return (
    <AppShell userName={currentUser.name} userRole={currentUser.role}>
      <CalendarView
        initialClasses={classes}
        initialDemos={demos}
        initialTasks={tasks}
        courses={courses}
        batches={batches}
        users={users}
        userRole={currentUser.role}
      />
    </AppShell>
  );
}
