import { ArrowRight, CalendarRange, ShieldCheck, Sparkles, CalendarDays, ListTodo, Users2, Mail, CheckCircle2 } from 'lucide-react';
import { sendMagicLinkAction } from './actions/auth';

const features = [
  { icon: CalendarDays, label: 'Calendar Grid', desc: 'Drag, resize, and reschedule classes & demos in real-time' },
  { icon: ListTodo, label: 'Task Kanban', desc: 'Track video & post deliverables with built-in stopwatch logging' },
  { icon: Users2, label: 'Client Hub', desc: 'Full task history timeline per client, searchable and filterable' },
  { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Admin, Mentor, and Employee roles with scoped dashboards' }
];

type HomePageProps = {
  searchParams: Promise<{ sent?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { sent } = await searchParams;

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

        {/* Secure Passwordless Login Section */}
        <section className="rounded-[32px] border border-white/8 bg-[rgba(17,19,26,0.9)] p-6 shadow-soft sm:p-8">
          <div className="rounded-[24px] border border-white/8 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Enterprise Security</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-text-primary">Passwordless Sign In</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <CalendarRange className="h-6 w-6" />
              </div>
            </div>

            {sent ? (
              <div className="mt-6 space-y-4 rounded-2xl border border-accent-class/30 bg-accent-class/10 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-class/20 text-accent-class">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">Check your email</h3>
                <p className="text-xs text-text-secondary">
                  We sent a secure login magic link to your email address. Click the link in your inbox to sign in.
                </p>
              </div>
            ) : (
              <form className="mt-6 space-y-4" action={sendMagicLinkAction}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-text-secondary">Work Email</span>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@company.com"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 pl-11 pr-4 py-3 text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Login Magic Link
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 rounded-[24px] border border-white/8 bg-white/5 p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-xs text-text-secondary">
              High-security zero-password authentication enabled. Access is restricted to authorized team email accounts.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
