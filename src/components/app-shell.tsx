'use client';

import { usePathname } from 'next/navigation';
import { CalendarDays, LayoutDashboard, ListTodo, ShieldCheck, Users2, User } from 'lucide-react';
import { signOutAction } from '@/app/actions/auth';

type UserRole = 'admin' | 'mentor' | 'employee';

type AppShellProps = {
  userName: string;
  userRole: UserRole;
  children?: React.ReactNode;
};

const roleNavigation: Record<UserRole, Array<{ label: string; href: string; icon: typeof CalendarDays }>> = {
  admin: [
    { label: 'Calendar Grid', href: '/dashboard', icon: CalendarDays },
    { label: 'Task Kanban', href: '/dashboard/tasks', icon: ListTodo },
    { label: 'Client Database', href: '/dashboard/clients', icon: Users2 },
    { label: 'Admin Users', href: '/dashboard/users', icon: ShieldCheck },
    { label: 'Activity Logs', href: '/dashboard/activity-logs', icon: LayoutDashboard },
    { label: 'Profile Settings', href: '/dashboard/profile', icon: User }
  ],
  mentor: [
    { label: 'Calendar Grid', href: '/dashboard', icon: CalendarDays },
    { label: 'Task Kanban', href: '/dashboard/tasks', icon: ListTodo },
    { label: 'Profile Settings', href: '/dashboard/profile', icon: User }
  ],
  employee: [
    { label: 'Calendar Grid', href: '/dashboard', icon: CalendarDays },
    { label: 'Task Kanban', href: '/dashboard/tasks', icon: ListTodo },
    { label: 'Client Database', href: '/dashboard/clients', icon: Users2 },
    { label: 'Profile Settings', href: '/dashboard/profile', icon: User }
  ]
};

export function AppShell({ userName, userRole, children }: AppShellProps) {
  const navigation = roleNavigation[userRole];
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid min-h-[calc(100vh-3rem)] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Left Sidebar */}
        <aside className="glass rounded-[28px] p-5 shadow-soft flex flex-col justify-between">
          <div>
            {/* App Logo + User */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-glow">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-tight text-text-primary truncate">
                  Virtual Calendar
                </p>
                <p className="text-sm text-text-secondary truncate">{userName}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="mb-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Role Scope</p>
              <p className="mt-1 text-sm font-semibold capitalize text-primary">{userRole}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? 'bg-primary/15 text-primary shadow-glow border border-primary/20'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? 'text-primary' : ''}`} />
                    <span>{item.label}</span>
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Sign Out */}
          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-text-primary transition hover:bg-accent-danger/20 hover:text-accent-danger"
            >
              Sign out
            </button>
          </form>
        </aside>

        {/* Main Content Area */}
        <main className="glass rounded-[28px] p-6 shadow-soft min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
