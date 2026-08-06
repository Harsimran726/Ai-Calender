import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchTasksDataAction } from '@/app/actions/tasks';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { getCurrentUser } from '@/lib/auth';

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient();
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/');
    }
  }

  const currentUser = await getCurrentUser();
  const { tasks, clients, users } = await fetchTasksDataAction();

  return (
    <AppShell userName={currentUser.name} userRole={currentUser.role}>
      <TaskKanban initialTasks={tasks} clients={clients} users={users} />
    </AppShell>
  );
}
