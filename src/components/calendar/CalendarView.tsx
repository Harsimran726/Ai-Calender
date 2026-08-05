'use client';

import { useState, useCallback } from 'react';
import { ClassEvent, DemoClassEvent, Task, UserProfile, Course, Batch } from '@/lib/types';
import { createClassAction, createDemoClassAction } from '@/app/actions/calendar';
import { Plus, ChevronLeft, ChevronRight, CheckCircle2, X, Bell, Clock } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type CalendarViewProps = {
  initialClasses: ClassEvent[];
  initialDemos: DemoClassEvent[];
  initialTasks: Task[];
  users: UserProfile[];
  courses: Course[];
  batches: Batch[];
  userRole: 'admin' | 'mentor' | 'employee';
};

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

type CombinedEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'class' | 'demo' | 'task';
  meta: string;
};

// ─── Calendar Helpers ─────────────────────────────────────────────────────────

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am – 9pm

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthGrid(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const cur = startOfWeek(first);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    if (cur.getMonth() !== month && w >= 3) break;
  }
  return weeks;
}

function getWeekDays(date: Date): Date[] {
  const mon = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function getEventsForDay(events: CombinedEvent[], date: Date): CombinedEvent[] {
  return events.filter((e) => isSameDay(new Date(e.start), date));
}

function eventTypeStyle(type: CombinedEvent['type']): { pill: string; border: string; text: string } {
  if (type === 'class') return { pill: 'bg-accent-class/20 text-accent-class', border: 'border-l-accent-class', text: 'text-accent-class' };
  if (type === 'demo')  return { pill: 'bg-accent-demo/20 text-accent-demo',   border: 'border-l-accent-demo',  text: 'text-accent-demo'  };
  return                       { pill: 'bg-primary/20 text-primary',            border: 'border-l-primary',       text: 'text-primary'      };
}

// ─── Sub-view: Month Grid ────────────────────────────────────────────────────

function MonthGrid({
  events, currentDate, onDayClick
}: { events: CombinedEvent[]; currentDate: Date; onDayClick: (d: Date) => void }) {
  const today = new Date();
  const weeks = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div>
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_SHORT.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-bold uppercase tracking-wider text-text-secondary">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const dayEvents = getEventsForDay(events, day);

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className={`min-h-[90px] cursor-pointer rounded-2xl border p-1.5 transition hover:-translate-y-0.5 hover:shadow-soft
                ${isToday ? 'border-primary/50 bg-primary/5' : 'border-white/6 bg-black/10 hover:bg-white/5'}
                ${!isCurrentMonth ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {/* Day number */}
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                ${isToday ? 'bg-primary text-white shadow-glow' : 'text-text-primary'}`}>
                {day.getDate()}
              </span>

              {/* Event pills */}
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className={`truncate rounded-lg px-1.5 py-0.5 text-[9px] font-semibold leading-tight ${eventTypeStyle(evt.type).pill}`}
                  >
                    {evt.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <p className="pl-1 text-[9px] text-text-secondary">+{dayEvents.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-view: Week Grid ─────────────────────────────────────────────────────

function WeekGrid({ events, currentDate }: { events: CombinedEvent[]; currentDate: Date }) {
  const today = new Date();
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {weekDays.map((day, i) => {
        const isToday = isSameDay(day, today);
        const dayEvents = getEventsForDay(events, day);

        return (
          <div
            key={i}
            className={`rounded-[20px] border p-2.5 min-h-[400px] transition
              ${isToday ? 'border-primary/40 bg-primary/5' : 'border-white/8 bg-black/10'}`}
          >
            {/* Day header */}
            <div className="mb-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{DAY_SHORT[i]}</p>
              <span className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
                ${isToday ? 'bg-primary text-white shadow-glow' : 'text-text-primary'}`}>
                {day.getDate()}
              </span>
            </div>

            {/* Events */}
            <div className="space-y-1.5">
              {dayEvents.length === 0
                ? <p className="pt-4 text-center text-[10px] italic text-text-secondary/40">—</p>
                : dayEvents.map((evt) => {
                  const s = eventTypeStyle(evt.type);
                  return (
                    <div key={evt.id} className={`rounded-xl border-l-2 px-2 py-1.5 ${s.border} ${s.pill.split(' ')[0]} `}>
                      <p className="truncate text-[11px] font-semibold text-text-primary">{evt.title}</p>
                      {evt.type !== 'task' && (
                        <p className={`mt-0.5 text-[10px] ${s.text}`}>
                          {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-view: Day Timeline ──────────────────────────────────────────────────

function DayTimeline({ events, currentDate }: { events: CombinedEvent[]; currentDate: Date }) {
  const today = new Date();
  const isToday = isSameDay(currentDate, today);
  const currentHour = today.getHours();
  const dayEvents = getEventsForDay(events, currentDate).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const getHourEvents = (hour: number) =>
    dayEvents.filter((e) => new Date(e.start).getHours() === hour);

  return (
    <div className="space-y-0">
      {HOURS.map((hour) => {
        const hourEvents = getHourEvents(hour);
        const isPast = isToday && currentHour > hour;
        const isCurrent = isToday && currentHour === hour;
        const label = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;

        return (
          <div key={hour} className={`flex gap-4 min-h-[56px] ${isPast ? 'opacity-40' : ''}`}>
            {/* Time label */}
            <div className="w-14 flex-shrink-0 pt-2 text-right">
              <span className={`text-[11px] font-mono ${isCurrent ? 'text-primary font-bold' : 'text-text-secondary'}`}>
                {label}
              </span>
            </div>

            {/* Slot */}
            <div className="relative flex-1 py-1">
              {/* Hour line */}
              <div className={`absolute left-0 top-3.5 right-0 h-px ${isCurrent ? 'bg-primary' : 'bg-white/8'}`} />
              {isCurrent && (
                <div className="absolute -left-1.5 top-[10px] h-4 w-4 rounded-full bg-primary ring-2 ring-background shadow-glow" />
              )}

              {/* Events in this hour */}
              <div className="pt-5 space-y-1.5">
                {hourEvents.map((evt) => {
                  const s = eventTypeStyle(evt.type);
                  return (
                    <div key={evt.id} className={`rounded-2xl border-l-4 px-4 py-3 ${s.border} ${s.pill.split(' ')[0]}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${s.text}`}>
                            {evt.type === 'class' ? 'Batch Class' : evt.type === 'demo' ? 'Demo Class' : 'Task'}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-text-primary truncate">{evt.title}</p>
                          <p className="mt-0.5 text-xs text-text-secondary">{evt.meta}</p>
                        </div>
                        {evt.type !== 'task' && (
                          <div className="flex-shrink-0 flex items-center gap-1 text-xs text-text-secondary">
                            <Clock className="h-3 w-3" />
                            {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' – '}
                            {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {dayEvents.length === 0 && (
        <div className="py-12 text-center text-text-secondary">
          <p className="text-sm font-medium text-text-primary">No events today</p>
          <p className="text-xs mt-1">Schedule a class or demo to fill this day.</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-view: Agenda List ───────────────────────────────────────────────────

function AgendaList({ events }: { events: CombinedEvent[] }) {
  const today = new Date().toDateString();

  const grouped = events.reduce<Record<string, CombinedEvent[]>>((acc, evt) => {
    const key = new Date(evt.start).toDateString();
    (acc[key] ??= []).push(evt);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center text-text-secondary">
        <p className="text-sm font-medium text-text-primary">No events in agenda</p>
        <p className="text-xs mt-1">Schedule classes or demos to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map((dateStr) => {
        const date = new Date(dateStr);
        const isToday = dateStr === today;
        const isPast = date < new Date() && !isToday;

        return (
          <div key={dateStr} className={isPast ? 'opacity-55' : ''}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-11 w-11 flex-col items-center justify-center rounded-2xl flex-shrink-0
                ${isToday ? 'bg-primary text-white shadow-glow' : 'bg-white/8 text-text-primary'}`}>
                <span className="text-[9px] font-bold uppercase leading-tight">
                  {date.toLocaleDateString([], { weekday: 'short' })}
                </span>
                <span className="text-base font-bold leading-tight">{date.getDate()}</span>
              </div>
              <div>
                <p className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                  {isToday ? '📅 Today' : date.toLocaleDateString([], { weekday: 'long' })}
                </p>
                <p className="text-xs text-text-secondary">
                  {date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className="ml-auto rounded-full bg-white/8 px-2.5 py-0.5 text-xs text-text-secondary">
                {grouped[dateStr].length} event{grouped[dateStr].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Events */}
            <div className="ml-14 space-y-2.5 border-l border-white/8 pl-4">
              {grouped[dateStr].map((evt) => {
                const s = eventTypeStyle(evt.type);
                return (
                  <div key={evt.id} className={`rounded-2xl border-l-4 px-4 py-3.5 ${s.border} ${s.pill.split(' ')[0]}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${s.text}`}>
                          {evt.type === 'class' ? 'Batch Class' : evt.type === 'demo' ? 'Demo Class' : 'Task'}
                        </span>
                        <p className="mt-0.5 text-sm font-semibold text-text-primary">{evt.title}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{evt.meta}</p>
                      </div>
                      {evt.type !== 'task' && (
                        <div className="flex-shrink-0 text-right text-xs text-text-secondary">
                          <p className="font-medium text-text-primary">
                            {new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p>– {new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main CalendarView Component ─────────────────────────────────────────────

export function CalendarView({
  initialClasses, initialDemos, initialTasks, users, courses, batches, userRole
}: CalendarViewProps) {
  const [classes, setClasses] = useState<ClassEvent[]>(initialClasses);
  const [demos, setDemos] = useState<DemoClassEvent[]>(initialDemos);
  const [tasks] = useState<Task[]>(initialTasks);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'class' | 'demo' | 'task'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'class' | 'demo'>('class');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Class form state
  const [classTitle, setClassTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.id || '');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(users.find((u) => u.role === 'mentor')?.id || users[0]?.id || '');
  const [startTime, setStartTime] = useState(() => { const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); });
  const [endTime, setEndTime]  = useState(() => { const n = new Date(Date.now() + 7200000); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); });
  const [isRecurring, setIsRecurring] = useState(false);

  // Demo form state
  const [demoTitle, setDemoTitle] = useState('');
  const [demoMentor, setDemoMentor] = useState(users.find((u) => u.role === 'mentor')?.id || users[0]?.id || '');
  const [demoStart, setDemoStart] = useState(() => { const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); });
  const [demoEnd, setDemoEnd]   = useState(() => { const n = new Date(Date.now() + 3600000); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); return n.toISOString().slice(0, 16); });
  const [studentName, setStudentName] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [demoAttendees, setDemoAttendees] = useState<Array<{ student_name: string; student_contact?: string }>>([]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);
  }, []);

  const allEvents: CombinedEvent[] = [
    ...classes.map((c) => ({
      id: c.id, title: c.title, start: c.start_time, end: c.end_time, type: 'class' as const,
      meta: users.find((u) => u.id === c.mentor_id)?.name || 'Unassigned Mentor'
    })),
    ...demos.map((d) => ({
      id: d.id, title: d.title, start: d.start_time, end: d.end_time, type: 'demo' as const,
      meta: `${d.attendees?.length || 0} Students registered`
    })),
    ...tasks.map((t) => ({
      id: t.id, title: t.title,
      start: t.due_at || t.created_at || new Date().toISOString(),
      end:   t.due_at || t.created_at || new Date().toISOString(),
      type: 'task' as const,
      meta: `${t.priority} priority · ${t.work_type}`
    }))
  ]
    .filter((e) => selectedCategory === 'all' || e.type === selectedCategory)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // ── Navigation ────────────────────────────────────────────────────────────

  const navigatePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  // Title for the nav header
  const navTitle = (() => {
    if (viewMode === 'month') return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      const from = days[0]; const to = days[6];
      return from.getMonth() === to.getMonth()
        ? `${from.getDate()} – ${to.getDate()} ${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}`
        : `${from.getDate()} ${MONTH_NAMES[from.getMonth()]} – ${to.getDate()} ${MONTH_NAMES[to.getMonth()]} ${to.getFullYear()}`;
    }
    if (viewMode === 'day') return currentDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    return 'Upcoming Events';
  })();

  // ── Event Handlers ────────────────────────────────────────────────────────

  const handleAddStudent = () => {
    if (!studentName.trim()) return;
    setDemoAttendees([...demoAttendees, { student_name: studentName.trim(), student_contact: studentContact.trim() || undefined }]);
    setStudentName(''); setStudentContact('');
  };

  const resetClassForm = () => {
    setClassTitle(''); setSelectedCourse(courses[0]?.id || ''); setSelectedBatch('');
    setSelectedMentor(users.find((u) => u.role === 'mentor')?.id || users[0]?.id || '');
    const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); setStartTime(n.toISOString().slice(0, 16));
    const e2 = new Date(Date.now() + 7200000); e2.setMinutes(e2.getMinutes() - e2.getTimezoneOffset()); setEndTime(e2.toISOString().slice(0, 16));
    setIsRecurring(false);
  };

  const resetDemoForm = () => {
    setDemoTitle(''); setDemoMentor(users.find((u) => u.role === 'mentor')?.id || users[0]?.id || '');
    const n = new Date(); n.setMinutes(n.getMinutes() - n.getTimezoneOffset()); setDemoStart(n.toISOString().slice(0, 16));
    const e2 = new Date(Date.now() + 3600000); e2.setMinutes(e2.getMinutes() - e2.getTimezoneOffset()); setDemoEnd(e2.toISOString().slice(0, 16));
    setDemoAttendees([]); setStudentName(''); setStudentContact('');
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const start = new Date(startTime); const end = new Date(endTime);
    if (end <= start) { alert('End time must be after start time.'); return; }
    setIsSubmitting(true);
    try {
      const newCls = await createClassAction({
        course_id: selectedCourse, batch_id: selectedBatch || null,
        mentor_id: selectedMentor, title: classTitle.trim() || courses.find((c) => c.id === selectedCourse)?.name || 'New Class',
        start_time: start.toISOString(), end_time: end.toISOString(), recurring: isRecurring
      });
      setClasses([newCls, ...classes]);
      setIsDrawerOpen(false); resetClassForm();
      showToast('✅ Class scheduled! Mentor notified + T-1hr reminder queued.');
    } catch { alert('Failed to create class.'); } finally { setIsSubmitting(false); }
  };

  const handleCreateDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const start = new Date(demoStart); const end = new Date(demoEnd);
    if (end <= start) { alert('End time must be after start time.'); return; }
    setIsSubmitting(true);
    try {
      const newDemo = await createDemoClassAction({
        mentor_id: demoMentor, title: demoTitle.trim() || 'Demo Class',
        start_time: start.toISOString(), end_time: end.toISOString(), attendees: demoAttendees
      });
      setDemos([newDemo, ...demos]);
      setIsDrawerOpen(false); resetDemoForm();
      showToast(`✅ Demo scheduled with ${demoAttendees.length} student${demoAttendees.length !== 1 ? 's' : ''}.`);
    } catch { alert('Failed to create demo.'); } finally { setIsSubmitting(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Toast */}
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-white/10 bg-surface px-5 py-3.5 text-sm font-semibold text-text-primary shadow-glow transition-all duration-300 ${toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <CheckCircle2 className="h-5 w-5 text-accent-class flex-shrink-0" />
        {toastMsg}
      </div>

      {/* ── Top Header ── */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Operations Hub</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-0.5">
            Schedule &amp; Calendar
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <div className="flex rounded-2xl border border-white/10 bg-black/40 p-1 text-[11px]">
            {(['all', 'class', 'demo', 'task'] as const).map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 font-semibold capitalize transition ${
                  selectedCategory === cat
                    ? cat === 'class' ? 'bg-accent-class text-black'
                    : cat === 'demo'  ? 'bg-accent-demo text-black'
                    : cat === 'task'  ? 'bg-primary text-white'
                    : 'bg-white/15 text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}>
                {cat === 'all' ? 'All' : cat === 'class' ? '📗 Classes' : cat === 'demo' ? '📙 Demos' : '📘 Tasks'}
              </button>
            ))}
          </div>

          {/* View mode tabs */}
          <div className="flex rounded-2xl border border-white/10 bg-black/40 p-1 text-[11px]">
            {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`rounded-xl px-3 py-1.5 font-medium capitalize transition ${
                  viewMode === mode ? 'bg-white/15 text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}>
                {mode}
              </button>
            ))}
          </div>

          {(userRole === 'admin' || userRole === 'mentor') && (
            <button onClick={() => { setDrawerType('class'); setIsDrawerOpen(true); }}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover">
              <Plus className="h-4 w-4" /> Schedule Event
            </button>
          )}
        </div>
      </div>

      {/* ── Calendar Navigation Bar ── */}
      {viewMode !== 'agenda' && (
        <div className="flex items-center gap-3">
          <button onClick={navigatePrev}
            className="rounded-xl border border-white/10 bg-black/40 p-2 text-text-secondary hover:text-text-primary transition">
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button onClick={goToday}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition">
            Today
          </button>

          <button onClick={navigateNext}
            className="rounded-xl border border-white/10 bg-black/40 p-2 text-text-secondary hover:text-text-primary transition">
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="font-display text-lg font-semibold text-text-primary">{navTitle}</span>

          <span className="ml-auto text-xs text-text-secondary">{allEvents.length} events</span>
        </div>
      )}

      {/* ── Main Calendar Area ── */}
      <div className="rounded-[24px] border border-white/8 bg-black/15 p-4 shadow-soft">
        {viewMode === 'month'  && <MonthGrid   events={allEvents} currentDate={currentDate} onDayClick={(d) => { setCurrentDate(d); setViewMode('day'); }} />}
        {viewMode === 'week'   && <WeekGrid    events={allEvents} currentDate={currentDate} />}
        {viewMode === 'day'    && <DayTimeline events={allEvents} currentDate={currentDate} />}
        {viewMode === 'agenda' && <AgendaList  events={allEvents} />}
      </div>

      {/* ── Reminders Strip (below calendar) ── */}
      {(classes.length > 0 || demos.length > 0) && (
        <div className="rounded-[24px] border border-white/8 bg-black/15 p-4 shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-text-primary">Automated Reminders (T-1hr before event)</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...classes.slice(0, 2).map((c) => ({
              type: 'class', title: c.title,
              reminderAt: new Date(new Date(c.start_time).getTime() - 3600000),
              extra: users.find((u) => u.id === c.mentor_id)?.name || 'Mentor'
            })), ...demos.slice(0, 2).map((d) => ({
              type: 'demo', title: d.title,
              reminderAt: new Date(new Date(d.start_time).getTime() - 3600000),
              extra: `${d.attendees.length} students`
            }))].map((r, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/5 p-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${r.type === 'class' ? 'bg-accent-class' : 'bg-accent-demo'}`} />
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${r.type === 'class' ? 'text-accent-class' : 'text-accent-demo'}`}>
                    {r.type === 'class' ? 'Batch Class' : 'Demo Class'}
                  </p>
                </div>
                <p className="text-sm font-semibold text-text-primary truncate">{r.title}</p>
                <p className="text-xs text-text-secondary">👤 {r.extra}</p>
                <p className="text-xs text-text-secondary">
                  🔔 {r.reminderAt.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {r.reminderAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Event Creation Drawer ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end"
          onClick={(e) => { if (e.target === e.currentTarget) setIsDrawerOpen(false); }}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-lg h-full bg-[rgba(17,19,26,0.98)] border-l border-white/10 shadow-glow overflow-y-auto flex flex-col">

            {/* Drawer header */}
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <div className="flex gap-2">
                {(['class', 'demo'] as const).map((type) => (
                  <button key={type} type="button" onClick={() => setDrawerType(type)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                      drawerType === type
                        ? type === 'class' ? 'bg-accent-class text-black' : 'bg-accent-demo text-black'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}>
                    {type === 'class' ? '📗 Class Module' : '📙 Demo Module'}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setIsDrawerOpen(false)}
                className="rounded-xl p-2 text-text-secondary hover:bg-white/10 hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Class Form */}
            {drawerType === 'class' ? (
              <form onSubmit={handleCreateClass} className="flex-1 p-6 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-class">Schedule a Batch Class</p>
                {[
                  { label: 'Class Title *', el: <input type="text" required placeholder="e.g. Next.js Server Actions" value={classTitle} onChange={(e) => setClassTitle(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent-class" /> },
                ].map(({ label, el }) => (
                  <div key={label}><label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>{el}</div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Course</label>
                  <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-class">
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Batch (optional)</label>
                  <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-class">
                    <option value="">— None —</option>
                    {batches.map((b) => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Mentor *</label>
                  <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-class">
                    {users.filter((u) => u.role === 'mentor' || u.role === 'admin').map((m) => <option key={m.id} value={m.id}>{m.name} · {m.email}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[{ label: 'Start *', val: startTime, set: setStartTime }, { label: 'End *', val: endTime, set: setEndTime }].map(({ label, val, set }) => (
                    <div key={label}><label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
                      <input type="datetime-local" required value={val} onChange={(e) => set(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-text-primary outline-none focus:border-accent-class" /></div>
                  ))}
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setIsRecurring(!isRecurring)} className={`h-5 w-9 rounded-full transition-colors relative ${isRecurring ? 'bg-accent-class' : 'bg-white/20'}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm text-text-secondary">Weekly recurring</span>
                </label>

                <div className="pt-2 border-t border-white/8">
                  <p className="text-xs text-text-secondary mb-3">💡 Mentor gets immediate email + T-1hr reminder.</p>
                  <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-accent-class px-4 py-3 text-sm font-bold text-black shadow-glow hover:opacity-90 disabled:opacity-50 transition">
                    {isSubmitting ? 'Scheduling...' : '📗 Schedule Class & Queue Reminder'}
                  </button>
                </div>
              </form>
            ) : (
              /* Demo Form */
              <form onSubmit={handleCreateDemo} className="flex-1 p-6 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-demo">Schedule a Demo Class</p>

                <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Demo Title *</label>
                  <input type="text" required placeholder="e.g. AI Engineering Workshop Demo" value={demoTitle} onChange={(e) => setDemoTitle(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-accent-demo" /></div>

                <div><label className="block text-xs font-medium text-text-secondary mb-1.5">Mentor *</label>
                  <select value={demoMentor} onChange={(e) => setDemoMentor(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-accent-demo">
                    {users.filter((u) => u.role === 'mentor' || u.role === 'admin').map((m) => <option key={m.id} value={m.id}>{m.name} · {m.email}</option>)}
                  </select></div>

                <div className="grid grid-cols-2 gap-3">
                  {[{ label: 'Start *', val: demoStart, set: setDemoStart }, { label: 'End *', val: demoEnd, set: setDemoEnd }].map(({ label, val, set }) => (
                    <div key={label}><label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
                      <input type="datetime-local" required value={val} onChange={(e) => set(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-text-primary outline-none focus:border-accent-demo" /></div>
                  ))}
                </div>

                {/* Student attendees */}
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Students</p>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-text-secondary">{demoAttendees.length} added</span>
                  </div>
                  {demoAttendees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {demoAttendees.map((st, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-text-primary">
                          👤 {st.student_name}
                          <button type="button" onClick={() => setDemoAttendees((p) => p.filter((_, j) => j !== i))} className="text-text-secondary hover:text-accent-danger">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" placeholder="Name" value={studentName} onChange={(e) => setStudentName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStudent(); }}}
                      className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary outline-none focus:border-accent-demo" />
                    <input type="text" placeholder="Contact" value={studentContact} onChange={(e) => setStudentContact(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStudent(); }}}
                      className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary outline-none focus:border-accent-demo" />
                    <button type="button" onClick={handleAddStudent} className="rounded-xl bg-accent-demo/20 text-accent-demo px-3 py-1.5 text-xs font-bold hover:bg-accent-demo/30 transition">+ Add</button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/8">
                  <p className="text-xs text-text-secondary mb-3">💡 Mentor gets immediate email. T-1hr reminder queued.</p>
                  <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-accent-demo px-4 py-3 text-sm font-bold text-black shadow-glow hover:opacity-90 disabled:opacity-50 transition">
                    {isSubmitting ? 'Scheduling...' : '📙 Schedule Demo Class'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
