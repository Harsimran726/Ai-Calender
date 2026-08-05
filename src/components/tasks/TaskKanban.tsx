'use client';

import { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, WorkType, Client, UserProfile } from '@/lib/types';
import { createTaskAction, updateTaskStatusAction, logTaskTimeAction } from '@/app/actions/tasks';
import { Plus, Play, Pause, X } from 'lucide-react';
import { BackButton } from '@/components/back-button';

type TaskKanbanProps = {
  initialTasks: Task[];
  clients: Client[];
  users: UserProfile[];
};

const columns: Array<{ id: TaskStatus; label: string; borderColor: string; dotColor: string }> = [
  { id: 'todo', label: '📋 To Do', borderColor: 'border-white/20', dotColor: 'bg-white/30' },
  { id: 'in_progress', label: '⚡ In Progress', borderColor: 'border-primary', dotColor: 'bg-primary' },
  { id: 'review', label: '🔍 Review', borderColor: 'border-accent-demo', dotColor: 'bg-accent-demo' },
  { id: 'done', label: '✅ Done', borderColor: 'border-accent-class', dotColor: 'bg-accent-class' }
];

const priorityBadges: Record<TaskPriority, { label: string; bg: string }> = {
  low: { label: 'Low', bg: 'bg-white/10 text-text-secondary' },
  medium: { label: 'Medium', bg: 'bg-primary/20 text-primary' },
  high: { label: 'High', bg: 'bg-accent-demo/20 text-accent-demo' },
  urgent: { label: 'Urgent', bg: 'bg-accent-danger/20 text-accent-danger' }
};

const workTypeIcons: Record<WorkType, string> = {
  video: '🎥',
  post: '📝',
  both: '🎥📝',
  other: '⚙️'
};

export function TaskKanban({ initialTasks, clients, users }: TaskKanbanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [timerStartMs, setTimerStartMs] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [workType, setWorkType] = useState<WorkType>('video');
  const [estMinutes, setEstMinutes] = useState(60);
  const [selectedClient, setSelectedClient] = useState(clients[0]?.id || '');
  const [assignedTo, setAssignedTo] = useState(users[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [dueAt, setDueAt] = useState('');

  // Stopwatch timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimerId) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - timerStartMs) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimerId, timerStartMs]);

  const handleToggleTimer = async (taskId: string) => {
    if (activeTimerId === taskId) {
      // Pause & Log time
      const addedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      await logTaskTimeAction(taskId, addedMinutes);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, actual_minutes: t.actual_minutes + addedMinutes } : t
        )
      );
      setActiveTimerId(null);
      setElapsedSeconds(0);
      setTimerStartMs(0);
    } else {
      // If another timer is running, stop it first (save 0 extra time)
      if (activeTimerId) {
        const prevElapsed = Math.floor((Date.now() - timerStartMs) / 1000);
        const addedMinutes = Math.max(1, Math.round(prevElapsed / 60));
        await logTaskTimeAction(activeTimerId, addedMinutes);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === activeTimerId ? { ...t, actual_minutes: t.actual_minutes + addedMinutes } : t
          )
        );
      }
      // Start new timer
      setActiveTimerId(taskId);
      setTimerStartMs(Date.now());
      setElapsedSeconds(0);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    await updateTaskStatusAction(taskId, newStatus);
  };

  const resetForm = () => {
    setTitle('');
    setPriority('medium');
    setWorkType('video');
    setEstMinutes(60);
    setSelectedClient(clients[0]?.id || '');
    setAssignedTo(users[0]?.id || '');
    setNotes('');
    setDueAt('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newTask = await createTaskAction({
        title: title.trim(),
        priority,
        estimated_minutes: Number(estMinutes),
        work_type: workType,
        notes: notes.trim() || null,
        client_id: selectedClient || null,
        assigned_to: assignedTo || null,
        due_at: dueAt ? new Date(dueAt).toISOString() : null
      });

      setTasks((prev) => [newTask, ...prev]);
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Productivity Tracking</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-0.5">
            Task Kanban Board
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {tasks.length} tasks · {tasks.filter((t) => t.status === 'done').length} completed
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </button>
      </div>

      {/* Active Timer Banner */}
      {activeTimerId && (
        <div className="flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/30 px-5 py-4 text-sm font-semibold text-primary">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span>
              ⏱ Stopwatch active: <span className="text-white">{fmtTime(elapsedSeconds)}</span> logged
            </span>
          </div>
          <button
            onClick={() => handleToggleTimer(activeTimerId)}
            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-hover transition"
          >
            Pause &amp; Save Time
          </button>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="flex flex-col rounded-[24px] border border-white/8 bg-black/15 p-4 min-h-[500px]">
              <div className={`flex items-center justify-between pb-3 mb-4 border-b ${col.borderColor}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <span className="font-display text-sm font-semibold text-text-primary">{col.label}</span>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                {colTasks.length === 0 && (
                  <p className="text-xs text-text-secondary text-center py-6 italic">No tasks here</p>
                )}
                {colTasks.map((t) => {
                  const clientObj = clients.find((c) => c.id === t.client_id);
                  const assignee = users.find((u) => u.id === t.assigned_to);
                  const isTiming = activeTimerId === t.id;
                  const progressPct = Math.min(100, (t.actual_minutes / (t.estimated_minutes || 1)) * 100);
                  const isOvertime = t.actual_minutes > t.estimated_minutes;

                  return (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-white/8 bg-white/5 p-4 shadow-soft transition hover:-translate-y-0.5 space-y-3"
                    >
                      {/* Title + Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-text-primary leading-snug">{t.title}</h4>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityBadges[t.priority].bg}`}>
                          {priorityBadges[t.priority].label}
                        </span>
                      </div>

                      {/* Work type + Client */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-text-secondary">
                        <span>{workTypeIcons[t.work_type]} {t.work_type}</span>
                        {clientObj && (
                          <>
                            <span>·</span>
                            <span className="text-primary font-medium">🏢 {clientObj.name}</span>
                          </>
                        )}
                        {assignee && (
                          <>
                            <span>·</span>
                            <span>👤 {assignee.name.split(' ')[0]}</span>
                          </>
                        )}
                      </div>

                      {/* Time Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-text-secondary">Est: {t.estimated_minutes}m</span>
                          <span className={isOvertime ? 'text-accent-danger font-bold' : 'text-text-secondary'}>
                            Actual: {t.actual_minutes}m
                            {isOvertime && ' ⚠️'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isOvertime ? 'bg-accent-danger' : 'bg-primary'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Due date */}
                      {t.due_at && (
                        <p className="text-[11px] text-text-secondary">
                          📅 Due: {new Date(t.due_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}

                      {/* Timer + Status Controls */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/8 gap-2">
                        <button
                          onClick={() => handleToggleTimer(t.id)}
                          title={isTiming ? 'Pause & save time' : 'Start stopwatch'}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                            isTiming
                              ? 'bg-accent-danger/20 text-accent-danger border border-accent-danger/30 animate-pulse'
                              : 'bg-white/10 text-text-primary hover:bg-primary/20 hover:text-primary'
                          }`}
                        >
                          {isTiming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {isTiming ? fmtTime(elapsedSeconds) : 'Start'}
                        </button>

                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as TaskStatus)}
                          className="rounded-xl border border-white/10 bg-black/40 px-2 py-1.5 text-[11px] font-medium text-text-secondary outline-none hover:border-primary transition"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              resetForm();
              setIsModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[rgba(17,19,26,0.98)] p-6 shadow-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <div>
                <h3 className="font-display text-xl font-semibold text-text-primary">Assign New Task</h3>
                <p className="text-xs text-text-secondary mt-0.5">Fill in the details below to create a task</p>
              </div>
              <button
                type="button"
                onClick={() => { resetForm(); setIsModalOpen(false); }}
                className="rounded-xl p-2 text-text-secondary hover:bg-white/10 hover:text-text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Task Title <span className="text-accent-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Edit Promo Reel for Client X"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Work Type</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as WorkType)}
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="video">🎥 Video</option>
                    <option value="post">📝 Post</option>
                    <option value="both">🎥📝 Both</option>
                    <option value="other">⚙️ Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Estimated Duration (minutes) <span className="text-accent-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={600}
                  value={estMinutes}
                  onChange={(e) => setEstMinutes(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Due Date (optional)</label>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Link to Client</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                  <option value="">— No client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                >
                  <option value="">— Unassigned —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Notes (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context, instructions, or deliverable details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => { resetForm(); setIsModalOpen(false); }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-hover disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
