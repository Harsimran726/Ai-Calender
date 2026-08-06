import { ArrowRight, CalendarRange, ShieldCheck, Sparkles, CalendarDays, ListTodo, Users2 } from 'lucide-react';
import { AuthForm } from '@/components/auth-form';

const features = [
  { icon: CalendarDays, label: 'Calendar Grid', desc: 'Drag, resize, and reschedule classes & demos in real-time' },
  { icon: ListTodo, label: 'Task Kanban', desc: 'Track video & post deliverables with built-in stopwatch logging' },
  { icon: Users2, label: 'Client Hub', desc: 'Full task history timeline per client, searchable and filterable' },
  { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Admin, Mentor, and Employee roles with scoped dashboards' }
];

type HomePageProps = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sent, error } = await searchParams;

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

        {/* Authentication Card with Security Analyzer */}
        <section className="rounded-[32px] border border-white/8 bg-[rgba(17,19,26,0.9)] p-6 shadow-soft sm:p-8">
          <AuthForm sent={sent === 'true'} error={error} />
        </section>

      </div>
    </main>
  );
}
