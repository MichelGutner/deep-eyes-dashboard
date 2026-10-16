import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';

interface Anomaly {
  id: string; metric: string; value: number; expectedValue: number; deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical'; timestamp: string; description: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'; impact: string;
}

interface Prediction {
  id: string; metric: string; currentValue: number; predictedValue: number;
  confidence: number; timeframe: string; trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

interface RootCause {
  id: string; incident: string; primaryCause: string; contributingFactors: string[];
  impact: 'low' | 'medium' | 'high' | 'critical'; resolution: string; prevention: string[];
  detectedAt: string; resolvedAt?: string;
}

interface BusinessMetric {
  id: string; name: string; value: number; target: number; unit: string;
  trend: 'up' | 'down' | 'stable'; change: number;
  category: 'revenue' | 'users' | 'performance' | 'operations';
}

interface CapacityForecast {
  id: string; resource: string; currentUsage: number; predictedUsage: number;
  timeframe: string; risk: 'low' | 'medium' | 'high' | 'critical'; recommendations: string[];
}

const SEV: Record<string, string> = {
  low:      'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  medium:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  high:     'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
};

const STATUS_SEV: Record<string, string> = {
  new:           'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  investigating: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  resolved:      'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  false_positive:'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

const BM: BusinessMetric[] = [
  { id: 'r1', name: 'Monthly Recurring Revenue', value: 125_000, target: 150_000, unit: 'USD', trend: 'up', change: 8.5, category: 'revenue' },
  { id: 'u1', name: 'Active Users', value: 15_420, target: 20_000, unit: 'users', trend: 'up', change: 12.3, category: 'users' },
  { id: 'p1', name: 'System Uptime', value: 99.8, target: 99.9, unit: '%', trend: 'stable', change: 0.1, category: 'performance' },
  { id: 'o1', name: 'Support Tickets', value: 45, target: 30, unit: 'tickets', trend: 'down', change: -15.2, category: 'operations' },
];

const CF: CapacityForecast[] = [
  { id: 'c0', resource: 'CPU',                 currentUsage: 62, predictedUsage: 78, timeframe: '1 month',  risk: 'medium', recommendations: ['Scale horizontally', 'Optimize compute'] },
  { id: 'c1', resource: 'Memory',              currentUsage: 74, predictedUsage: 91, timeframe: '1 week',   risk: 'high',   recommendations: ['Increase limits', 'Check for leaks'] },
  { id: 'c2', resource: 'Storage',             currentUsage: 45, predictedUsage: 62, timeframe: '3 months', risk: 'low',    recommendations: ['Add caching', 'Archive old data'] },
  { id: 'c3', resource: 'Network',             currentUsage: 38, predictedUsage: 55, timeframe: '1 month',  risk: 'low',    recommendations: ['Monitor bandwidth'] },
  { id: 'c4', resource: 'DB Connections',      currentUsage: 82, predictedUsage: 95, timeframe: '1 week',   risk: 'critical', recommendations: ['Increase pool size', 'Add read replicas'] },
  { id: 'c5', resource: 'API Rate Limit',      currentUsage: 51, predictedUsage: 70, timeframe: '1 month',  risk: 'medium', recommendations: ['Implement caching', 'Upgrade plan'] },
];

function genAnomalies(): Anomaly[] {
  const metrics = ['CPU Usage', 'Memory Usage', 'Response Time', 'Error Rate', 'Throughput'];
  const sevs: Anomaly['severity'][] = ['low', 'medium', 'high', 'critical'];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `a${i}`, metric: metrics[i % 5], value: Math.floor(Math.random() * 100),
    expectedValue: Math.floor(Math.random() * 80) + 10, deviation: Math.floor(Math.random() * 50) + 10,
    severity: sevs[i % 4], timestamp: new Date(Date.now() - Math.random() * 86_400_000).toISOString(),
    description: `Anomaly in ${metrics[i % 5]}`,
    status: (['new', 'investigating', 'resolved', 'false_positive'] as const)[i % 4],
    impact: ['Low impact', 'Moderate degradation', 'Significant impact', 'Critical failure'][i % 4],
  }));
}

function genPredictions(): Prediction[] {
  const metrics = ['User Growth', 'Revenue', 'Server Load', 'Storage', 'API Calls'];
  const trends: Prediction['trend'][] = ['increasing', 'decreasing', 'stable'];
  return Array.from({ length: 10 }, (_, i) => ({
    id: `p${i}`, metric: metrics[i % 5], currentValue: Math.floor(Math.random() * 1000),
    predictedValue: Math.floor(Math.random() * 1500) + 500, confidence: Math.floor(Math.random() * 30) + 70,
    timeframe: ['1 hour', '24 hours', '7 days', '30 days'][i % 4], trend: trends[i % 3],
    factors: ['User activity', 'Seasonal patterns', 'Marketing campaigns'].slice(0, (i % 3) + 1),
  }));
}

function genRCAs(): RootCause[] {
  const causes = ['DB connection pool exhaustion', 'Memory leak', 'Network latency spike', 'Third-party outage', 'Config error'];
  const impacts: RootCause['impact'][] = ['low', 'medium', 'high', 'critical'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `rca${i}`, incident: `Incident ${i + 1}`, primaryCause: causes[i % 5],
    contributingFactors: ['High traffic', 'Insufficient monitoring', 'Lack of redundancy'].slice(0, (i % 3) + 1),
    impact: impacts[i % 4], resolution: ['Restarted service', 'Increased resources', 'Fixed config', 'Circuit breaker'][i % 4],
    prevention: ['Add monitoring', 'Implement caching', 'Increase redundancy'].slice(0, (i % 3) + 1),
    detectedAt: new Date(Date.now() - Math.random() * 7 * 86_400_000).toISOString(),
    resolvedAt: i % 3 !== 0 ? new Date(Date.now() - Math.random() * 6 * 86_400_000).toISOString() : undefined,
  }));
}

const TABS = [
  { id: 'anomalies',   label: 'Anomalies',          icon: AlertTriangle },
  { id: 'predictions', label: 'Predictions',         icon: Activity },
  { id: 'rca',         label: 'Root Cause',          icon: Activity },
  { id: 'business',    label: 'Business Metrics',    icon: BarChart3 },
  { id: 'capacity',    label: 'Capacity Planning',   icon: Activity },
];

export const AdvancedAnalytics: React.FC = () => {
  const [view, setView] = useState('anomalies');
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [rcas, setRcas] = useState<RootCause[]>([]);
  const [sevFilter, setSevFilter] = useState('all');

  useEffect(() => {
    setAnomalies(genAnomalies());
    setPredictions(genPredictions());
    setRcas(genRCAs());
  }, []);

  const filteredAnomalies = anomalies.filter(a => sevFilter === 'all' || a.severity === sevFilter);

  const trendIcon = (t: string) => t === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> : t === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-red-500" /> : <Activity className="w-3.5 h-3.5 text-gray-400" />;

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${view === tab.id ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Anomalies */}
      {view === 'anomalies' && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="form-select text-xs py-1 px-2 h-7">
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{filteredAnomalies.length} anomalies</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {filteredAnomalies.map(a => (
              <div key={a.id} className="py-2.5 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[a.severity]}`}>{a.severity}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_SEV[a.status]}`}>{a.status.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{a.metric}</span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{a.description}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                    <span>val: {a.value}</span><span>exp: {a.expectedValue}</span><span>Δ: +{a.deviation}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {view === 'predictions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {predictions.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{p.metric}</span>
                <div className="flex items-center gap-1.5">
                  {p.trend === 'increasing' ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> : p.trend === 'decreasing' ? <TrendingDown className="w-3.5 h-3.5 text-green-500" /> : <Activity className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="text-xs text-gray-400 dark:text-gray-500">{p.timeframe}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[['Current', p.currentValue], ['Predicted', p.predictedValue], ['Confidence', `${p.confidence}%`]].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                    <p className="text-gray-400 dark:text-gray-500">{k}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.factors.map(f => <span key={f} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded">{f}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Root Cause */}
      {view === 'rca' && (
        <div className="card space-y-3">
          {rcas.map(r => (
            <div key={r.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[r.impact]}`}>{r.impact}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{r.incident}</span>
                <div className="ml-auto flex gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{new Date(r.detectedAt).toLocaleDateString()}</span>
                  {r.resolvedAt && <span>→ {new Date(r.resolvedAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div><span className="text-gray-400 dark:text-gray-500">Cause:</span> <span className="text-gray-900 dark:text-white">{r.primaryCause}</span></div>
                <div><span className="text-gray-400 dark:text-gray-500">Resolution:</span> <span className="text-gray-900 dark:text-white">{r.resolution}</span></div>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {r.contributingFactors.map(f => <span key={f} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded">{f}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Business Metrics */}
      {view === 'business' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BM.map(m => {
            const pct = Math.min(Math.round((m.value / m.target) * 100), 100);
            const onTarget = pct >= 100;
            const warn = pct >= 80;
            return (
              <div key={m.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{m.category}</span>
                  {trendIcon(m.trend)}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.value.toLocaleString()}<span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">{m.unit}</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.name}</p>
                <div className={`text-xs mt-1 font-medium ${m.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {m.change >= 0 ? '+' : ''}{m.change}% vs target
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
                    <span>Progress to target</span><span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${onTarget ? 'bg-green-500' : warn ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Capacity */}
      {view === 'capacity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CF.map(c => {
            const danger = c.predictedUsage > 90;
            const warn = c.predictedUsage > 75;
            return (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.resource}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEV[c.risk]}`}>{c.risk}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  {[['Current', `${c.currentUsage}%`], ['Predicted', `${c.predictedUsage}%`], ['In', c.timeframe]].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                      <p className="text-gray-400 dark:text-gray-500">{k}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                  <div className={`h-1.5 rounded-full transition-all ${danger ? 'bg-red-500' : warn ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${c.predictedUsage}%` }} />
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.recommendations.map(r => <span key={r} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] rounded">· {r}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
