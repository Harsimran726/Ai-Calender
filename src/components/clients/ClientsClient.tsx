'use client';

import { useState } from 'react';
import { Client, ClientStatus, Task } from '@/lib/types';
import { createClientAction, fetchClientDetailAction } from '@/app/actions/clients';
import { Building2, Plus, Search, Calendar, CheckCircle2, Clock, User, FileText, ArrowRight, X } from 'lucide-react';
import { BackButton } from '@/components/back-button';

type ClientsClientProps = {
  initialClients: Client[];
  userRole: 'admin' | 'mentor' | 'employee';
};

export function ClientsClient({ initialClients, userRole }: ClientsClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientTasks, setSelectedClientTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Client Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [industry, setIndustry] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectClient = async (clientId: string) => {
    setSelectedClientId(clientId);
    const { clientTasks } = await fetchClientDetailAction(clientId);
    setSelectedClientTasks(clientTasks);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const result = await createClientAction({
      name,
      company,
      contact,
      industry,
      notes,
      status
    });

    if (!result.success || !result.client) {
      alert(result.error || 'Failed to create client. Please try again.');
      return;
    }

    setClients([result.client, ...clients]);
    setName('');
    setCompany('');
    setContact('');
    setIndustry('');
    setNotes('');
    setIsModalOpen(false);
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard" label="Dashboard" />
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-secondary">Centralized Repository</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary mt-0.5">Client Database</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage client accounts, contract specs, and view full Task History timelines.</p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            + Add Client
          </button>
        )}
      </div>

      {/* Main Grid View: Client List + Detail Timeline */}
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Left Column: Client Cards */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search clients by name, company, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 pl-11 pr-4 py-3 text-sm text-text-primary outline-none transition focus:border-primary"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filteredClients.map((cli) => {
              const isSelected = cli.id === selectedClientId;

              return (
                <div
                  key={cli.id}
                  onClick={() => handleSelectClient(cli.id)}
                  className={`cursor-pointer rounded-[24px] border p-5 transition shadow-soft hover:-translate-y-0.5 ${
                    isSelected ? 'border-primary bg-primary/10 shadow-glow' : 'border-white/8 bg-black/15 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20 font-bold text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-primary">{cli.name}</h4>
                        <p className="text-xs text-text-secondary">{cli.company || 'Private Client'}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${
                        cli.status === 'active' ? 'bg-accent-class/20 text-accent-class' : 'bg-white/10 text-text-secondary'
                      }`}
                    >
                      {cli.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-text-secondary border-t border-white/8 pt-3">
                    <span>Industry: {cli.industry || 'General'}</span>
                    <span className="flex items-center gap-1 font-medium text-primary">
                      Task History <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Client Detail & Transaction Log */}
        <div className="rounded-[24px] border border-white/8 bg-black/15 p-5 shadow-soft min-h-[500px]">
          {selectedClient ? (
            <div className="space-y-6">
              <div className="border-b border-white/8 pb-4">
                <span className="text-xs uppercase tracking-wider text-primary font-medium">Selected Profile</span>
                <h3 className="font-display text-2xl font-semibold text-text-primary mt-1">{selectedClient.name}</h3>
                <p className="text-sm text-text-secondary">{selectedClient.company} • {selectedClient.contact}</p>
                {selectedClient.notes && <p className="mt-2 text-xs italic text-text-secondary">&quot;{selectedClient.notes}&quot;</p>}
              </div>

              <div>
                <h4 className="font-display text-base font-semibold text-text-primary mb-3">Task History (Transaction Log)</h4>
                {selectedClientTasks.length === 0 ? (
                  <p className="text-sm text-text-secondary italic">No completed or assigned tasks recorded for this client yet.</p>
                ) : (
                  <div className="relative border-l border-white/10 pl-4 space-y-4">
                    {selectedClientTasks.map((t) => (
                      <div key={t.id} className="relative group">
                        <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-black" />
                        <p className="text-xs text-text-secondary">{t.due_at ? new Date(t.due_at).toLocaleDateString() : 'Recent'}</p>
                        <p className="font-semibold text-sm text-text-primary">{t.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                          <span className="capitalize">Type: {t.work_type}</span>
                          <span>•</span>
                          <span>Time: {t.actual_minutes}m / {t.estimated_minutes}m</span>
                          <span>•</span>
                          <span className="capitalize text-accent-class font-medium">{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center text-text-secondary">
              <Building2 className="h-12 w-12 text-white/20 mb-3" />
              <p className="font-medium text-text-primary">Select a client profile</p>
              <p className="text-xs">Click any client on the left to inspect their complete Task History timeline.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[rgba(20,22,28,0.95)] p-6 shadow-glow">
            <div className="flex items-center justify-between pb-4 border-b border-white/8">
              <h3 className="font-display text-xl font-semibold text-text-primary">Onboard New Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Company / Brand</label>
                <input
                  type="text"
                  placeholder="Acme Dynamics Ltd."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Contact Email / Phone</label>
                <input
                  type="text"
                  placeholder="contact@acme.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Software, Healthcare, E-commerce"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1">Notes & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Add account details, contract notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-glow hover:bg-primary-hover"
                >
                  Add Client Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
