import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchClientsAction } from '@/app/actions/clients';
import { ClientsClient } from '@/components/clients/ClientsClient';
import { getCurrentUser } from '@/lib/auth';

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient();
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/');
    }
  }

  const currentUser = await getCurrentUser();
  const clients = await fetchClientsAction();

  return (
    <AppShell userName={currentUser.name} userRole={currentUser.role}>
      <ClientsClient initialClients={clients} userRole={currentUser.role} />
    </AppShell>
  );
}
