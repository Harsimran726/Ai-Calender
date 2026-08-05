import { ArrowRight, CalendarRange, ShieldCheck, Sparkles, CalendarDays, ListTodo, Users2 } from 'lucide-react';
import { signInAction } from './actions/auth';

const features = [
  { icon: CalendarDays, label: 'Calendar Grid', desc: 'Drag, resize, and reschedule classes & demos in real-time' },
  { icon: ListTodo, label: 'Task Kanban', desc: 'Track video & post deliverables with built-in stopwatch logging' },
  { icon: Users2, label: 'Client Hub', desc: 'Full task history timeline per client, searchable and filterable' },
  { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Admin, Mentor, and Employee roles with scoped dashboards' }
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid min-h-[calc(100vh-3rem)] gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[rgba(20,22,28,0.82)] p-8 shadow-soft sm:p-10">
          <div className="absolute inset-0 grid-noise opacity-20" />
          <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-accent-class/10 blur-3xl" />
          <div className="absolute top-32 left-1/2 h-40 w-40 rounded-full bg-accent-demo/8 blur-3xl" />

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-text-secondary">
              <Sparkles className="h-4 w-4 text-primary" />
              Company Calendar + Operations Hub
            </div>

            <h1 className="font-display text-5xl font-semibold tracking-tight text-text-primary sm:text-6xl leading-tight">
              One place for classes, demos, tasks &amp; client history.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-text-secondary">
              Replace scattered reminders and spreadsheets with a premium internal workspace that keeps scheduling,
              productivity, and admin control in sync.
            </p>

            {/* Feature Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="rounded-[20px] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</p>
                  </div>
                  <p className="text-sm leading-5 text-text-primary">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Login Section */}
        <section className="rounded-[32px] border border-white/8 bg-[rgba(17,19,26,0.9)] p-6 shadow-soft sm:p-8">
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Welcome back</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-text-primary">Sign in</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <CalendarRange className="h-6 w-6" />
              </div>
            </div>

            <form className="mt-6 space-y-4" action={signInAction}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-secondary">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue="admin@company.com"
                  placeholder="admin@company.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-text-secondary">Password</span>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover"
              >
                Sign in
              </button>

              {/* Quick access — development shortcut */}
              <a
                href="/dashboard"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-text-secondary transition hover:bg-white/10 hover:text-text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                Quick Access (Dev Mode — skip login)
              </a>
            </form>
          </div>

          <div className="mt-4 rounded-[24px] border border-white/8 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
              Dev Credentials (no Supabase needed)
            </p>
            <div className="space-y-1 text-xs text-text-secondary font-mono">
              <p>📧 admin@company.com → <span className="text-primary">Admin</span></p>
              <p>📧 sarah.mentor@company.com → <span className="text-accent-class">Mentor</span></p>
              <p>📧 jordan.emp@company.com → <span className="text-accent-demo">Employee</span></p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
