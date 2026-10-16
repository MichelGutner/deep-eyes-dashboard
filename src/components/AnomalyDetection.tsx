import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Shield, Target, TrendingUp, Zap, XCircle, AlertCircle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnomalyData {
  id: string; timestamp: string;
  type: 'performance' | 'security' | 'error' | 'resource' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string; value: number; expectedValue: number; deviation: number;
  confidence: number; description: string;
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  source: string; affectedServices: string[]; recommendations: string[];
}

interface AnomalyPattern {
  id: string; name: string; description: string; confidence: number;
  frequency: number; lastSeen: string; severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: string; affectedMetrics: string[];
}

const ANOMALIES: AnomalyData[] = [
  { id: '1', timestamp: '2024-01-15T10:30:00Z', type: 'performance', severity: 'high', metric: 'response_time', value: 850, expectedValue: 180, deviation: 372, confidence: 95.2, description: 'Response time spike in payment service', status: 'detected', source: 'payment-service', affectedServices: ['payment-service', 'user-service'], recommendations: ['Check DB connection pool', 'Review recent deployments', 'Monitor CPU usage'] },
  { id: '2', timestamp: '2024-01-15T09:45:00Z', type: 'security', severity: 'critical', metric: 'failed_logins', value: 150, expectedValue: 5, deviation: 2900, confidence: 98.7, description: 'Unusual spike in failed login attempts', status: 'investigating', source: 'auth-service', affectedServices: ['auth-service'], recommendations: ['Enable rate limiting', 'Check for brute force', 'Block suspicious IPs'] },
  { id: '3', timestamp: '2024-01-15T08:20:00Z', type: 'error', severity: 'medium', metric: 'error_rate', value: 8.5, expectedValue: 0.5, deviation: 1600, confidence: 87.3, description: 'Increased error rate in notification service', status: 'detected', source: 'notification-service', affectedServices: ['notification-service'], recommendations: ['Check external API', 'Review error logs', 'Monitor queue health'] },
  { id: '4', timestamp: '2024-01-15T07:15:00Z', type: 'resource', severity: 'high', metric: 'memory_usage', value: 95, expectedValue: 65, deviation: 46, confidence: 92.1, description: 'Memory usage exceeded threshold', status: 'resolved', source: 'user-service', affectedServices: ['user-service'], recommendations: ['Restart pods', 'Check for memory leaks', 'Increase limits'] },
];

const PATTERNS: AnomalyPattern[] = [
  { id: '1', name: 'Periodic Performance Degradation', description: 'Performance issues every 4 hours', confidence: 94.2, frequency: 6, lastSeen: '2024-01-15T10:30:00Z', severity: 'high', pattern: 'Every 4h: response time +300-500ms', affectedMetrics: ['response_time', 'throughput', 'error_rate'] },
  { id: '2', name: 'Security Attack Pattern', description: 'Repeated failed logins from same IP range', confidence: 97.8, frequency: 12, lastSeen: '2024-01-15T09:45:00Z', severity: 'critical', pattern: 'Multiple failed logins from 192.168.1.x', affectedMetrics: ['failed_logins', 'security_events'] },
  { id: '3', name: 'Resource Exhaustion', description: 'Memory spikes → service restarts', confidence: 89.5, frequency: 3, lastSeen: '2024-01-15T07:15:00Z', severity: 'medium', pattern: 'Memory >90% → pod restart within 5min', affectedMetrics: ['memory_usage', 'pod_restarts'] },
];

const TRENDS = [
  { time: '00:00', anomalies: 2, performance: 1, security: 0, error: 1 },
  { time: '04:00', anomalies: 1, performance: 0, security: 0, error: 1 },
  { time: '08:00', anomalies: 3, performance: 1, security: 1, error: 1 },
  { time: '12:00', anomalies: 5, performance: 2, security: 1, error: 2 },
  { time: '16:00', anomalies: 4, performance: 1, security: 1, error: 2 },
  { time: '20:00', anomalies: 2, performance: 1, security: 0, error: 1 },
];

const CONF_DIST = [
  { range: '90-100%', count: 8, color: '#ef4444' },
  { range: '80-89%', count: 12, color: '#f59e0b' },
  { range: '70-79%', count: 15, color: '#3b82f6' },
  { range: '60-69%', count: 6, color: '#10b981' },
];

const SEV: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  low:      'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

function TypeIcon({ type }: { type: string }) {
  const cls = 'w-3.5 h-3.5';
  if (type === 'performance') return <TrendingUp className={cls} />;
  if (type === 'security') return <Shield className={cls} />;
  if (type === 'error') return <AlertTriangle className={cls} />;
  if (type === 'resource') return <Activity className={cls} />;
  if (type === 'network') return <Zap className={cls} />;
  return <AlertCircle className={cls} />;
}

function StatusIcon({ status }: { status: string }) {
  const cls = 'w-3.5 h-3.5';
  if (status === 'detected') return <AlertCircle className={`${cls} text-yellow-500`} />;
  if (status === 'investigating') return <Clock className={`${cls} text-blue-500`} />;
  if (status === 'resolved') return <CheckCircle className={`${cls} text-green-500`} />;
  return <XCircle className={`${cls} text-gray-400`} />;
}

export const AnomalyDetection: React.FC = () => {
  const [selected, setSelected] = useState<AnomalyData | null>(null);
  const [filters, setFilters] = useState({ type: 'all', severity: 'all', status: 'all', timeRange: '24h' });

  const avgConf = ANOMALIES.length ? Math.round(ANOMALIES.reduce((a, b) => a + b.confidence, 0) / ANOMALIES.length) : 0;

  const filtered = ANOMALIES.filter(a => {
    if (filters.type !== 'all' && a.type !== filters.type) return false;
    if (filters.severity !== 'all' && a.severity !== filters.severity) return false;
    if (filters.status !== 'all' && a.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: ANOMALIES.length, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' },
          { label: 'Patterns', value: PATTERNS.length, color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' },
          { label: 'Avg confidence', value: `${avgConf}%`, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
          { label: 'Resolved', value: ANOMALIES.filter(a => a.status === 'resolved').length, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${s.color}`}>
            <span className="font-bold text-sm">{s.value}</span>
            <span className="opacity-75">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Anomaly trends (24h)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Perf" />
              <Line type="monotone" dataKey="security" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Security" />
              <Line type="monotone" dataKey="error" stroke="#10b981" strokeWidth={1.5} dot={false} name="Error" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Confidence distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={CONF_DIST} cx="50%" cy="50%" outerRadius={65} innerRadius={30} dataKey="count" paddingAngle={2}
                label={({ range, count }) => `${range}: ${count}`} labelLine={false}>
                {CONF_DIST.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters + anomaly list */}
      <div className="card space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'type', opts: ['all','performance','security','error','resource','network'] },
            { key: 'severity', opts: ['all','critical','high','medium','low'] },
            { key: 'status', opts: ['all','detected','investigating','resolved','false_positive'] },
            { key: 'timeRange', opts: ['1h','6h','24h','7d'] },
          ].map(({ key, opts }) => (
            <select key={key} value={filters[key as keyof typeof filters]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))} className="form-select text-xs py-1 px-2 h-7">
              {opts.map(o => <option key={o} value={o}>{key === 'timeRange' ? o : (o === 'all' ? `All ${key}` : o)}</option>)}
            </select>
          ))}
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{filtered.length} anomalies</span>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {filtered.map(a => (
            <div key={a.id}
              className={`py-3 cursor-pointer transition-colors ${selected?.id === a.id ? 'bg-blue-50 dark:bg-blue-900/10 -mx-4 px-4' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}`}
              onClick={() => setSelected(selected?.id === a.id ? null : a)}>
              <div className="flex items-start gap-2.5">
                <TypeIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <StatusIcon status={a.status} />
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[a.severity]}`}>{a.severity}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{a.source}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{a.description}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <span>val: <strong className="text-gray-700 dark:text-gray-300">{a.value}</strong></span>
                    <span>exp: <strong className="text-gray-700 dark:text-gray-300">{a.expectedValue}</strong></span>
                    <span>Δ: <strong className="text-orange-600 dark:text-orange-400">+{a.deviation.toFixed(0)}%</strong></span>
                    <span>conf: <strong className="text-gray-700 dark:text-gray-300">{a.confidence.toFixed(1)}%</strong></span>
                  </div>
                </div>
              </div>

              {selected?.id === a.id && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Affected services</p>
                    <div className="flex flex-wrap gap-1">
                      {a.affectedServices.map(s => <span key={s} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded">{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Recommendations</p>
                    {a.recommendations.map((r, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <Target className="w-3 h-3 text-blue-500 flex-shrink-0" />{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Pattern recognition</h3>
        <div className="space-y-3">
          {PATTERNS.map(p => (
            <div key={p.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[p.severity]}`}>{p.severity}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{p.description}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-mono">{p.pattern}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>conf: <strong className="text-gray-700 dark:text-gray-300">{p.confidence.toFixed(1)}%</strong></span>
                <span>freq: <strong className="text-gray-700 dark:text-gray-300">{p.frequency}×</strong></span>
                <span>last: <strong className="text-gray-700 dark:text-gray-300">{new Date(p.lastSeen).toLocaleString()}</strong></span>
                <span>metrics: <strong className="text-gray-700 dark:text-gray-300">{p.affectedMetrics.length}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
