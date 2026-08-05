import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchClientsAction } from '@/app/actions/clients';
import { getUsers } from '@/lib/store';
import { ClientsClient } from '@/components/clients/ClientsClient';

export default async function ClientsPage() {
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

  const clients = await fetchClientsAction();

  return (
    <AppShell userName={userName} userRole={userRole}>
      <ClientsClient initialClients={clients} userRole={userRole} />
    </AppShell>
  );
}
