import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { fetchClientsAction } from '@/app/actions/clients';
import { ClientsClient } from '@/components/clients/ClientsClient';
import { requireAuth } from '@/lib/auth';

export default async function ClientsPage() {
  const currentUser = await requireAuth();
  if (!currentUser) redirect('/');

  const clients = await fetchClientsAction();

  return (
    <AppShell userName={currentUser.name} userRole={currentUser.role}>
      <ClientsClient initialClients={clients} userRole={currentUser.role} />
    </AppShell>
  );
}
