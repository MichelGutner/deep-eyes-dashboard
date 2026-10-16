import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePerformance } from '../hooks/usePerformance';
import {
  AlertTriangle,
  CheckCircle,
  Download,
  Frown,
  Meh,
  Smile,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DataPoint {
  label: string;
  p50: number;
  p95: number;
  p99: number;
  throughput: number;
  errorRate: number;
  cpu: number;
  memory: number;
  apdex: number;
}

interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  p95: number;
  rpm: number;
  errorPct: number;
  apdex: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jitter(base: number, pct: number) {
  return base * (1 + (Math.random() - 0.5) * pct);
}

function apdexScore(p50: number, t = 200, f = 800): number {
  const s = p50 <= t ? 1 : p50 <= f ? 0.5 : 0;
  return Math.round(s * 100) / 100;
}

function apdexLabel(score: number): { label: string; color: string; bg: string; icon: React.ReactNode } {
  if (score >= 0.94) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: <Smile className="w-4 h-4" /> };
  if (score >= 0.85) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: <Smile className="w-4 h-4" /> };
  if (score >= 0.70) return { label: 'Fair', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: <Meh className="w-4 h-4" /> };
  return { label: 'Poor', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: <Frown className="w-4 h-4" /> };
}

function generateData(points: number): DataPoint[] {
  return Array.from({ length: points }, (_, i) => {
    const h = points - 1 - i;
    const label = `${String(new Date(Date.now() - h * 3600_000).getHours()).padStart(2, '0')}h`;
    const p50 = jitter(120, 0.6);
    return {
      label,
      p50: Math.round(p50),
      p95: Math.round(p50 * jitter(2.2, 0.3)),
      p99: Math.round(p50 * jitter(3.8, 0.4)),
      throughput: Math.round(jitter(820, 0.3)),
      errorRate: Math.round(jitter(0.9, 1.2) * 10) / 10,
      cpu: Math.round(jitter(48, 0.4)),
      memory: Math.round(jitter(68, 0.25)),
      apdex: apdexScore(p50),
    };
  });
}

const ENDPOINTS: Endpoint[] = [
  { path: '/api/orders',          method: 'POST',   p95: 312, rpm: 142, errorPct: 1.2, apdex: 0.91 },
  { path: '/api/products',        method: 'GET',    p95: 87,  rpm: 980, errorPct: 0.1, apdex: 0.98 },
  { path: '/api/auth/refresh',    method: 'POST',   p95: 54,  rpm: 320, errorPct: 0.3, apdex: 0.99 },
  { path: '/api/checkout/validate', method: 'POST', p95: 891, rpm: 67,  errorPct: 3.8, apdex: 0.62 },
  { path: '/api/media/upload',    method: 'POST',   p95: 2340, rpm: 18, errorPct: 0.9, apdex: 0.41 },
  { path: '/api/users/:id',       method: 'GET',    p95: 63,  rpm: 560, errorPct: 0.0, apdex: 0.99 },
  { path: '/api/feed',            method: 'GET',    p95: 445, rpm: 230, errorPct: 0.6, apdex: 0.78 },
];

const PERIODS = ['1h', '24h', '7d', '30d'] as const;
type Period = typeof PERIODS[number];

const PERIOD_POINTS: Record<Period, number> = { '1h': 12, '24h': 24, '7d': 28, '30d': 30 };

const tooltipStyle = {
  contentStyle: {
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    fontSize: 12,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Performance: React.FC = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('24h');
  const [data, setData] = useState<DataPoint[]>([]);
  const { data: perfData } = usePerformance(period);

  useEffect(() => {
    setData(generateData(PERIOD_POINTS[period]));
    const id = setInterval(() => setData(generateData(PERIOD_POINTS[period])), 30_000);
    return () => clearInterval(id);
  }, [period]);

  if (data.length === 0) return null;

  const latest = data[data.length - 1];
  const prev = data[data.length - 2] ?? latest;
  const avgApdex = Math.round((data.reduce((s, d) => s + d.apdex, 0) / data.length) * 100) / 100;
  const apdex = apdexLabel(avgApdex);

  // Sobrescreve os KPIs com dados reais quando disponíveis
  const realThroughput = perfData?.throughput ?? latest.throughput;
  const realErrorRate = perfData?.errorRate ?? latest.errorRate;

  const delta = (curr: number, prev: number, invert = false) => {
    const d = curr - prev;
    const better = invert ? d < 0 : d > 0;
    return { d, better, sign: d >= 0 ? '+' : '' };
  };

  const stats = [
    {
      label: 'P50 latência',
      value: `${latest.p50}ms`,
      ...delta(latest.p50, prev.p50, true),
      unit: 'ms',
    },
    {
      label: 'Throughput',
      value: `${realThroughput}`,
      ...delta(realThroughput, prev.throughput),
      unit: 'req/min',
    },
    {
      label: 'Error rate',
      value: `${realErrorRate}%`,
      ...delta(realErrorRate, prev.errorRate, true),
      unit: '%',
    },
    {
      label: 'CPU',
      value: `${latest.cpu}%`,
      ...delta(latest.cpu, prev.cpu, true),
      unit: '%',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Latência, throughput e recursos — {period}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => toast.success(t('performance_report_exported'))}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-xs">Export</span>
          </button>
        </div>
      </div>

      {/* Compact stats strip + Apdex */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Apdex pill — highlighted */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${apdex.bg} ${apdex.color} border-current/20`}>
          {apdex.icon}
          <span>Apdex</span>
          <span className="font-bold tabular-nums">{avgApdex}</span>
          <span className="text-xs font-normal opacity-70">{apdex.label}</span>
        </div>

        {/* Other stats */}
        {stats.map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
            <span className="font-semibold text-gray-900 dark:text-white tabular-nums">{s.value}</span>
            <span className={`text-xs font-medium ${s.better ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
              {s.sign}{s.d.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Row 1: Response time percentiles + Throughput & Error rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Response time p50/p95/p99 */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Response Time — Percentis</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />p50</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block rounded" />p95</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block rounded" />p99</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={36} tickFormatter={v => `${v}ms`} />
              <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [`${v}ms`, name]} />
              <ReferenceLine y={200} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} label={{ value: 'T=200ms', fontSize: 9, fill: '#f59e0b', position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="p50" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" stroke="#fb923c" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Throughput + Error rate */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Throughput & Error Rate</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />req/min</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" />errors %</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="#9ca3af" width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#9ca3af" width={32} tickFormatter={v => `${v}%`} />
              <Tooltip {...tooltipStyle} />
              <Line yAxisId="left" type="monotone" dataKey="throughput" name="req/min" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="errorRate" name="error %" stroke="#f87171" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: CPU + Memory combined + Top endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CPU + Memory */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">CPU & Memória</h3>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded" />CPU</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" />Memória</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={32} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip {...tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, name]} />
              <Area type="monotone" dataKey="cpu" name="CPU" stroke="#f59e0b" strokeWidth={2} fill="url(#cpuGrad)" dot={false} />
              <Area type="monotone" dataKey="memory" name="Memória" stroke="#8b5cf6" strokeWidth={2} fill="url(#memGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top endpoints by p95 */}
        <div className="card p-0">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Endpoints mais lentos — p95</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {ENDPOINTS.sort((a, b) => b.p95 - a.p95).map(ep => {
              const slow = ep.p95 > 800;
              const warn = ep.p95 > 300;
              const { color } = apdexLabel(ep.apdex);
              return (
                <div key={ep.path} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                    ep.method === 'GET' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                    ep.method === 'POST' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                    'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  }`}>{ep.method}</span>
                  <span className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 truncate">{ep.path}</span>
                  <span className={`text-xs font-semibold tabular-nums ${slow ? 'text-red-600 dark:text-red-400' : warn ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {ep.p95 >= 1000 ? `${(ep.p95 / 1000).toFixed(1)}s` : `${ep.p95}ms`}
                  </span>
                  <span className={`text-xs tabular-nums ${color}`}>{ep.apdex}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Apdex trend */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Apdex ao longo do tempo</h3>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {[['Excellent', '#10b981', '0.94'], ['Good', '#3b82f6', '0.85'], ['Fair', '#f59e0b', '0.70']].map(([l, c, v]) => (
              <span key={l} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: c }} />
                {l} ≥{v}
              </span>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="apdexGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={32} domain={[0, 1]} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [v.toFixed(2), 'Apdex']} />
            <ReferenceLine y={0.94} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={0.85} stroke="#3b82f6" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={0.70} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} />
            <Area type="monotone" dataKey="apdex" stroke="#10b981" strokeWidth={2} fill="url(#apdexGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts — compact */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
            <span className="font-semibold">/api/media/upload</span> — p95 acima de 2s há 15min
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap">2m atrás</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
            Error rate voltou abaixo de 1% — recuperação após deploy <span className="font-mono text-xs">v2.4.1</span>
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap">5m atrás</span>
        </div>
      </div>
    </div>
  );
};
