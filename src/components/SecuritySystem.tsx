import { AlertTriangle, CheckCircle, Clock, Lock, Shield, ShieldAlert, Unlock, User, X, XCircle, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useSecurity } from '../hooks/useSecurity';

interface SecurityEvent {
  id: string; timestamp: string;
  type: 'login' | 'logout' | 'access_denied' | 'suspicious_activity' | 'threat_detected' | 'config_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string; ip: string; location: string; action: string; resource: string;
  details: Record<string, unknown>; status: 'investigating' | 'resolved' | 'false_positive';
}

interface ThreatIntel {
  id: string; type: 'ip' | 'domain' | 'hash' | 'url';
  value: string; threatLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string[]; lastSeen: string; description: string; source: string;
}

interface AccessControl {
  id: string; user: string; role: string; permissions: string[];
  lastLogin: string; status: 'active' | 'suspended' | 'expired'; mfaEnabled: boolean;
}

interface Metrics {
  totalEvents: number; threatsBlocked: number; suspiciousActivities: number;
  failedLogins: number; successfulLogins: number; threatLevel: string;
}

const SEV: Record<string, string> = {
  low:      'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

function EventIcon({ type }: { type: string }) {
  const cls = 'w-3.5 h-3.5';
  if (type === 'login') return <Unlock className={`${cls} text-green-500`} />;
  if (type === 'logout') return <Lock className={`${cls} text-gray-400`} />;
  if (type === 'access_denied') return <ShieldAlert className={`${cls} text-red-500`} />;
  if (type === 'suspicious_activity') return <AlertTriangle className={`${cls} text-orange-500`} />;
  if (type === 'threat_detected') return <Shield className={`${cls} text-red-500`} />;
  return <Settings className={`${cls} text-blue-500`} />;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'investigating') return <Clock className="w-3.5 h-3.5 text-yellow-500" />;
  if (status === 'resolved') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
  return <XCircle className="w-3.5 h-3.5 text-gray-400" />;
}

function genThreats(): ThreatIntel[] {
  const types: ThreatIntel['type'][] = ['ip', 'domain', 'hash', 'url'];
  const levels: ThreatIntel['threatLevel'][] = ['low', 'medium', 'high', 'critical'];
  return Array.from({ length: 12 }, (_, i) => ({
    id: `th${i}`, type: types[i % 4],
    value: `threat-${(i * 7 + 13).toString(36)}`, threatLevel: levels[i % 4],
    category: ['malware', 'phishing', 'botnet'].slice(0, (i % 2) + 1),
    lastSeen: new Date(Date.now() - Math.random() * 86_400_000).toISOString(),
    description: 'Suspicious activity detected', source: 'CrowdStrike',
  }));
}

function genAccess(): AccessControl[] {
  const roles = ['admin', 'user', 'viewer', 'operator'];
  return Array.from({ length: 10 }, (_, i) => ({
    id: `ac${i}`, user: `user-${i}`, role: roles[i % 4],
    permissions: ['read', 'write', 'delete'].slice(0, (i % 3) + 1),
    lastLogin: new Date(Date.now() - Math.random() * 86_400_000).toISOString(),
    status: (['active', 'suspended', 'expired'] as const)[i % 3],
    mfaEnabled: i % 3 !== 0,
  }));
}

const TIMELINE = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}h`, events: Math.floor(Math.random() * 10), threats: Math.floor(Math.random() * 3),
}));

export const SecuritySystem: React.FC = () => {
  const [selected, setSelected] = useState<SecurityEvent | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [view, setView] = useState<'events' | 'threats' | 'access'>('events');

  const { data: secData } = useSecurity(timeRange);

  // Mapeia eventos do backend para SecurityEvent
  const events: SecurityEvent[] = (secData?.events ?? []).map(e => ({
    id: e.id,
    timestamp: e.timestamp,
    type: e.type as SecurityEvent['type'],
    severity: e.severity,
    user: e.user,
    ip: e.ip,
    location: '—',
    action: e.action,
    resource: e.resource,
    details: {},
    status: e.status,
  }));

  // Threats e Access ainda são mock (features futuras)
  const [threats] = useState<ThreatIntel[]>(genThreats);
  const [access] = useState<AccessControl[]>(genAccess);

  const blocked = events.filter(e => e.type === 'threat_detected').length;
  const metrics: Metrics = {
    totalEvents: events.length,
    threatsBlocked: blocked,
    suspiciousActivities: events.filter(e => e.type === 'suspicious_activity').length,
    failedLogins: events.filter(e => e.type === 'access_denied').length,
    successfulLogins: events.filter(e => e.type === 'login').length,
    threatLevel: blocked > 10 ? 'critical' : blocked > 5 ? 'high' : blocked > 2 ? 'medium' : 'low',
  };

  const threatDistData = [
    { name: 'Blocked', value: metrics.threatsBlocked, color: '#ef4444' },
    { name: 'Suspicious', value: metrics.suspiciousActivities, color: '#f59e0b' },
    { name: 'Failed logins', value: metrics.failedLogins, color: '#8b5cf6' },
    { name: 'Logins OK', value: metrics.successfulLogins, color: '#10b981' },
  ];

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total events', value: metrics.totalEvents, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
          { label: 'Threats blocked', value: metrics.threatsBlocked, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
          { label: 'Suspicious', value: metrics.suspiciousActivities, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' },
          { label: 'Failed logins', value: metrics.failedLogins, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
          { label: `Threat: ${metrics.threatLevel}`, value: '', color: SEV[metrics.threatLevel] + ' border-current' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${s.color}`}>
            {s.value !== '' && <span className="font-bold text-sm">{s.value}</span>}
            <span className={s.value !== '' ? 'opacity-75' : 'font-semibold'}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Threat distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={threatDistData} cx="50%" cy="50%" outerRadius={65} innerRadius={30} dataKey="value" paddingAngle={2}>
                {threatDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Security timeline (24h)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={2} dot={false} name="Events" />
              <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} dot={false} name="Threats" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-fit">
        {[{ id: 'events', label: 'Events' }, { id: 'threats', label: 'Threat Intel' }, { id: 'access', label: 'Access Control' }].map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id as typeof view)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === tab.id ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
        {view === 'events' && (
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="ml-2 form-select text-xs py-1 px-2 h-7">
            <option value="1h">1h</option><option value="24h">24h</option><option value="7d">7d</option>
          </select>
        )}
      </div>

      {/* Events table */}
      {view === 'events' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {['Event', 'User', 'IP', 'Location', 'Severity', 'Status', 'Time'].map(h => (
                    <th key={h} className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {events.slice(0, 15).map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer" onClick={() => setSelected(ev)}>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-1.5">
                        <EventIcon type={ev.type} />
                        <span className="text-gray-700 dark:text-gray-300 capitalize text-xs whitespace-nowrap">{ev.type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-400 text-xs">{ev.user}</td>
                    <td className="py-2 pr-4 text-gray-500 dark:text-gray-500 text-xs font-mono">{ev.ip}</td>
                    <td className="py-2 pr-4 text-gray-500 dark:text-gray-400 text-xs">{ev.location}</td>
                    <td className="py-2 pr-4"><span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[ev.severity]}`}>{ev.severity}</span></td>
                    <td className="py-2 pr-4"><div className="flex items-center gap-1"><StatusIcon status={ev.status} /><span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{ev.status.replace('_', ' ')}</span></div></td>
                    <td className="py-2 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Threat intel */}
      {view === 'threats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {threats.map(th => (
            <div key={th.id} className="card">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[th.threatLevel]}`}>{th.threatLevel}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{th.type}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5 font-mono text-xs">{th.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{th.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                <span>{th.source}</span>
                <span>{new Date(th.lastSeen).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1 mt-1.5">
                {th.category.map(c => <span key={c} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded">{c}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Access control */}
      {view === 'access' && (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['User', 'Role', 'Status', 'MFA', 'Permissions', 'Last Login'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {access.map(ac => (
                <tr key={ac.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{ac.user}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 capitalize text-gray-600 dark:text-gray-400">{ac.role}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${ac.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : ac.status === 'suspended' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{ac.status}</span>
                  </td>
                  <td className="py-2.5 pr-4">{ac.mfaEnabled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">{ac.permissions.map(p => <span key={p} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] rounded">{p}</span>)}</div>
                  </td>
                  <td className="py-2.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{new Date(ac.lastLogin).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Event detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <EventIcon type={selected.type} />
                {selected.type.replace('_', ' ')}
              </h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[['User', selected.user], ['IP', selected.ip], ['Location', selected.location], ['Action', selected.action], ['Resource', selected.resource], ['Status', selected.status]].map(([k, v]) => (
                <div key={k}><span className="text-xs text-gray-400 dark:text-gray-500">{k}</span><p className="font-medium text-gray-900 dark:text-white capitalize">{String(v).replace('_', ' ')}</p></div>
              ))}
            </div>
            <div className="mt-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Details</p>
              <pre className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-xs font-mono overflow-x-auto text-gray-700 dark:text-gray-300">{JSON.stringify(selected.details, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
