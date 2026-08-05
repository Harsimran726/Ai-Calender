import { AppShell } from '@/components/app-shell';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getActivityLogs, getUsers } from '@/lib/store';
import { Clock, Activity, AlertCircle } from 'lucide-react';
import type { ActivityLog } from '@/lib/types';
import { BackButton } from '@/components/back-button';

export default async function ActivityLogsPage() {
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

    if (profile?.role !== 'admin') {
      redirect('/dashboard');
    }

    userName = profile?.name ?? user.email ?? 'User';
    userRole = profile?.role ?? 'admin';
  } else {
    const seedAdmin = getUsers().find((u) => u.role === 'admin');
    if (seedAdmin) {
      userName = seedAdmin.name;
      userRole = seedAdmin.role;
    }
  }

  // Fetch logs — from Supabase if connected, else in-memory store
  let logs: ActivityLog[] = getActivityLogs();
  if (supabase) {
    const { data: dbLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (dbLogs && dbLogs.length > 0) {
      logs = dbLogs as ActivityLog[];
    }
  }

  const entityColors: Record<string, string> = {
    users: 'text-primary',
    classes: 'text-accent-class',
    demo_classes: 'text-accent-demo',
    tasks: 'text-accent-task',
    clients: 'text-accent-demo',
    system: 'text-text-secondary'
  };

  return (
    <AppShell userName={userName} userRole={userRole}>
      <div className="space-y-6">
        <BackButton href="/dashboard" label="Dashboard" />
        {/* Header */}
        <div className="border-b border-border pb-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Admin Governance</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-0.5">
              System Activity Audit Log
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Immutable audit trail of all create, update, and delete actions across Virtual Calendar.
            </p>
          </div>
          <span className="text-sm text-text-secondary">
            {logs.length} entries recorded
          </span>
        </div>

        {/* Log table */}
        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-black/15 shadow-soft">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-text-secondary">
              <AlertCircle className="h-12 w-12 text-white/10 mb-4" />
              <p className="font-semibold text-text-primary">No activity logs yet</p>
              <p className="text-xs mt-1 max-w-xs">
                Logs are created automatically when users create, update, or delete records.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/8">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-white/[0.02] gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {log.actor_name}{' '}
                        <span className="font-normal text-text-secondary">— {log.action}</span>
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Entity:{' '}
                        <span className={`capitalize font-semibold ${entityColors[log.entity_type] ?? 'text-primary'}`}>
                          {log.entity_type.replace('_', ' ')}
                        </span>
                        {log.entity_id && (
                          <span className="ml-1 font-mono opacity-60">
                            #{log.entity_id.slice(0, 8)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
