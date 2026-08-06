'use client';

import { useState, useTransition } from 'react';
import { Batch } from '@/lib/types';
import { createBatchAction, updateBatchAction, deleteBatchAction } from '@/app/actions/calendar';
import { Plus, Pencil, Trash2, Check, X, Loader2, Layers } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type BatchManagerProps = {
  initialBatches: Batch[];
  onClose: () => void;
  onBatchesChange: (batches: Batch[]) => void;
};

type EditState = {
  id: string;
  batch_name: string;
  start_date: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BatchManager({ initialBatches, onClose, onBatchesChange }: BatchManagerProps) {
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [isPending, startTransition] = useTransition();

  // New batch form state
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editState, setEditState] = useState<EditState | null>(null);
  const [editError, setEditError] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  // ── Add Batch ────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!newName.trim()) { setAddError('Batch name is required.'); return; }
    setAddError('');

    startTransition(async () => {
      const result = await createBatchAction({ batch_name: newName.trim(), start_date: newDate || null });
      if (!result.success || !result.batch) {
        setAddError(result.error || 'Failed to create batch.');
        return;
      }
      const updated = [result.batch, ...batches];
      setBatches(updated);
      onBatchesChange(updated);
      setNewName('');
      setNewDate('');
      setIsAdding(false);
    });
  };

  // ── Edit Batch ────────────────────────────────────────────────────────────

  const startEdit = (b: Batch) => {
    setEditState({ id: b.id, batch_name: b.batch_name, start_date: b.start_date ? b.start_date.slice(0, 10) : '' });
    setEditError('');
    setDeleteError('');
  };

  const handleEdit = () => {
    if (!editState || !editState.batch_name.trim()) { setEditError('Name required.'); return; }
    setEditError('');

    startTransition(async () => {
      const result = await updateBatchAction(editState.id, {
        batch_name: editState.batch_name.trim(),
        start_date: editState.start_date || null
      });
      if (!result.success) { setEditError(result.error || 'Update failed.'); return; }
      const updated: Batch[] = batches.map((b) =>
        b.id === editState.id
          ? { ...b, batch_name: editState.batch_name.trim(), start_date: editState.start_date || undefined }
          : b
      );
      setBatches(updated);
      onBatchesChange(updated);
      setEditState(null);
    });
  };

  // ── Delete Batch ──────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    setDeleteError('');
    setDeletingId(id);

    startTransition(async () => {
      const result = await deleteBatchAction(id);
      setDeletingId(null);
      if (!result.success) { setDeleteError(result.error || 'Delete failed.'); return; }
      const updated = batches.filter((b) => b.id !== id);
      setBatches(updated);
      onBatchesChange(updated);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-xl mx-4 rounded-[28px] border border-white/10 bg-[rgba(17,19,26,0.98)] shadow-glow flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-text-primary">Batch Management</h2>
              <p className="text-xs text-text-secondary">{batches.length} batch{batches.length !== 1 ? 'es' : ''} total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-secondary hover:bg-white/10 hover:text-text-primary transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Error strip */}
          {(deleteError || editError) && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              ⚠️ {deleteError || editError}
            </div>
          )}

          {/* Add Batch Panel */}
          {isAdding ? (
            <div className="rounded-[20px] border border-primary/30 bg-primary/5 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">New Batch</p>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Batch Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Batch 2025-Q3"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-primary"
                />
                {addError && <p className="text-xs text-red-400 mt-1">{addError}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Start Date (optional)</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-primary-hover disabled:opacity-50 transition"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Batch
                </button>
                <button
                  onClick={() => { setIsAdding(false); setNewName(''); setNewDate(''); setAddError(''); }}
                  className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-white/5 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 rounded-[20px] border border-dashed border-white/20 py-3 text-sm font-semibold text-text-secondary hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition"
            >
              <Plus className="h-4 w-4" />
              Add New Batch
            </button>
          )}

          {/* Batch List */}
          {batches.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-text-secondary">No batches yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="group rounded-[20px] border border-white/8 bg-black/20 px-4 py-3 transition hover:border-white/15 hover:bg-white/4"
                >
                  {editState?.id === batch.id ? (
                    /* ── Edit Row ── */
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-medium text-text-secondary mb-1">Name</label>
                          <input
                            type="text"
                            value={editState.batch_name}
                            onChange={(e) => setEditState({ ...editState, batch_name: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-text-secondary mb-1">Start Date</label>
                          <input
                            type="date"
                            value={editState.start_date}
                            onChange={(e) => setEditState({ ...editState, start_date: e.target.value })}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      {editError && <p className="text-xs text-red-400">{editError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={handleEdit}
                          disabled={isPending}
                          className="flex items-center gap-1.5 rounded-xl bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/30 disabled:opacity-50 transition"
                        >
                          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          Save
                        </button>
                        <button
                          onClick={() => { setEditState(null); setEditError(''); }}
                          className="flex items-center gap-1.5 rounded-xl bg-white/5 text-text-secondary px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Display Row ── */
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{batch.batch_name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {batch.start_date ? `📅 Starts ${fmtDate(batch.start_date)}` : '📅 No start date set'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(batch)}
                          className="rounded-xl p-2 text-text-secondary hover:bg-white/10 hover:text-primary transition"
                          title="Edit batch"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(batch.id)}
                          disabled={deletingId === batch.id || isPending}
                          className="rounded-xl p-2 text-text-secondary hover:bg-red-500/15 hover:text-red-400 disabled:opacity-50 transition"
                          title="Delete batch"
                        >
                          {deletingId === batch.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
