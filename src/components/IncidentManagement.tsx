import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Shield, User, Users, Zap, Activity, FileText, MessageSquare } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents';
import type { Incident } from '../services/incidentsService';

const SEV: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  low:      'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};
const STATUS: Record<string, string> = {
  open:          'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  investigating: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  mitigated:     'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  resolved:      'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  closed:        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

function duration(inc: Incident) {
  const ms = (inc.resolvedAt ? new Date(inc.resolvedAt) : new Date()).getTime() - new Date(inc.created_at).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

function AutoBadge({ s }: { s: string }) {
  if (s === 'automated') return <Zap className="w-3.5 h-3.5 text-green-500" aria-label="Automated" />;
  if (s === 'semi_automated') return <Activity className="w-3.5 h-3.5 text-yellow-500" aria-label="Semi-automated" />;
  return <User className="w-3.5 h-3.5 text-gray-400" aria-label="Manual" />;
}

export const IncidentManagement: React.FC = () => {
  const { data, isLoading } = useIncidents();
  const incidents = data?.incidents ?? [];
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filters, setFilters] = useState({ status: 'all', severity: 'all', type: 'all' });

  // Keep selected in sync with fresh data from server
  const selectedFresh = selected ? (incidents.find(i => i.id === selected.id) ?? selected) : null;

  const active = incidents.filter(i => ['open', 'investigating', 'mitigated'].includes(i.status)).length;
  const avgRes = '—';

  if (isLoading && incidents.length === 0) {
    return <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading incidents...</div>;
  }

  const filtered = incidents.filter(i => {
    if (filters.status !== 'all' && i.status !== filters.status) return false;
    if (filters.severity !== 'all' && i.severity !== filters.severity) return false;
    if (filters.type !== 'all' && i.type !== filters.type) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Active', value: active, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
          { label: 'Resolved today', value: incidents.filter(i => i.status === 'resolved').length, icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' },
          { label: 'Avg resolution', value: avgRes, icon: <Clock className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
          { label: 'Total', value: incidents.length, icon: <Shield className="w-3.5 h-3.5" />, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${s.color}`}>
            {s.icon}
            <span className="font-bold text-sm">{s.value}</span>
            <span className="opacity-75">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: list */}
        <div className="lg:col-span-2 space-y-3">
          {/* Filters */}
          <div className="card py-2.5 flex items-center gap-2 flex-wrap">
            {[
              { key: 'status', opts: ['all','open','investigating','mitigated','resolved','closed'] },
              { key: 'severity', opts: ['all','critical','high','medium','low'] },
              { key: 'type', opts: ['all','performance','security','availability','data','infrastructure'] },
            ].map(({ key, opts }) => (
              <select key={key} value={filters[key as keyof typeof filters]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} className="form-select text-xs py-1 px-2 h-7">
                {opts.map(o => <option key={o} value={o}>{o === 'all' ? `All ${key}` : o}</option>)}
              </select>
            ))}
          </div>

          {/* Incident cards */}
          <div className="space-y-2">
            {filtered.map(inc => (
              <div
                key={inc.id}
                onClick={() => setSelected(selectedFresh?.id === inc.id ? null : inc)}
                className={`card cursor-pointer transition-all ${selectedFresh?.id === inc.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : 'hover:shadow-md'}`}
              >
                <div className="flex items-start gap-3">
                  <AutoBadge s={inc.automationStatus} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{inc.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[inc.severity]}`}>{inc.severity}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS[inc.status]}`}>{inc.status}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{duration(inc)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{inc.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                      <span>{inc.reporter}</span>
                      {inc.assignee && <><span>·</span><span>{inc.assignee}</span></>}
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(inc.affectedServices ?? []).map(s => <span key={s} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] rounded">{s}</span>)}
                      {(inc.tags ?? []).map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded">{t}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: detail panel */}
        <div className="space-y-3">
          {selected ? (
            <>
              <div className="card space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selected.id} — Details</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400 dark:text-gray-500">Impact:</span> <span className="text-gray-900 dark:text-white">{selected.impact}</span></div>
                  {selected.rootCause && <div><span className="text-gray-400 dark:text-gray-500">Root cause:</span> <span className="text-gray-900 dark:text-white">{selected.rootCause}</span></div>}
                  {selected.resolution && <div><span className="text-gray-400 dark:text-gray-500">Resolution:</span> <span className="text-gray-900 dark:text-white">{selected.resolution}</span></div>}
                </div>
                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
                  {[
                    { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Add comment' },
                    { icon: <Users className="w-3.5 h-3.5" />, label: 'Reassign' },
                    { icon: <FileText className="w-3.5 h-3.5" />, label: 'View runbook' },
                  ].map(a => (
                    <button key={a.label} className="btn-secondary text-xs flex items-center gap-1.5 justify-start">
                      {a.icon}{a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline / Comments */}
              <div className="card">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Timeline</h3>
                {selected.comments.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500">No comments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selected.comments.map(ev => (
                      <div key={ev.id} className="flex gap-2.5">
                        <div className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{ev.userId}</span>
                            <span className="text-gray-400 dark:text-gray-500 ml-auto flex-shrink-0">{new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{ev.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card flex items-center justify-center h-32 text-sm text-gray-400 dark:text-gray-500">
              Select an incident to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
