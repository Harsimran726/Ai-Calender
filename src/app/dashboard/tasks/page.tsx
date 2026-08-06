import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { fetchTasksDataAction } from '@/app/actions/tasks';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { requireAuth } from '@/lib/auth';

export default async function TasksPage() {
  const currentUser = await requireAuth();
  if (!currentUser) redirect('/');

  const { tasks, clients, users } = await fetchTasksDataAction();

  return (
    <AppShell userName={currentUser.name} userRole={currentUser.role}>
      <TaskKanban initialTasks={tasks} clients={clients} users={users} />
    </AppShell>
  );
}
