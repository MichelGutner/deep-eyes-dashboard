import React, { useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Globe,
  Server,
  Smartphone,
  Wifi,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SystemHealth } from './SystemHealth';
import { RealTimeSystem } from './RealTimeSystem';

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceContext = 'backend' | 'mobile' | 'web';
type BackendTab = 'system' | 'realtime';
type MobileTab = 'overview' | 'crashes' | 'network' | 'devices';
type WebTab = 'vitals' | 'errors' | 'performance' | 'network';

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const rand = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, '0')}h`,
  crashes: rand(0, 12),
  anr: rand(0, 3),
  sessions: rand(800, 2400),
  errors: rand(2, 40),
}));

const VITALS_TREND = Array.from({ length: 24 }, (_, i) => ({
  h: `${String(i).padStart(2, '0')}h`,
  lcp: +(Math.random() * 1.5 + 1.2).toFixed(2),
  fid: rand(30, 120),
  cls: +(Math.random() * 0.15).toFixed(3),
}));

const DEVICE_SPLIT = [
  { name: 'iOS', value: 48, color: '#6b7280' },
  { name: 'Android', value: 52, color: '#10b981' },
];

const TOP_CRASHES = [
  { type: 'NullPointerException', platform: 'Android', count: 234, users: 89 },
  { type: 'EXC_BAD_ACCESS',       platform: 'iOS',     count: 187, users: 63 },
  { type: 'IllegalStateException', platform: 'Android', count: 142, users: 51 },
  { type: 'Swift.DecodingError',  platform: 'iOS',     count: 98,  users: 37 },
  { type: 'OutOfMemoryError',      platform: 'Android', count: 67,  users: 28 },
];

const WEB_NETWORK = Array.from({ length: 12 }, (_, i) => ({
  h: `${String(i * 2).padStart(2, '0')}h`,
  p50: rand(80, 200),
  p95: rand(300, 900),
  errors: +(Math.random() * 3).toFixed(1),
}));

const tooltipStyle = {
  contentStyle: { borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 },
};

// ─── Stat chip ────────────────────────────────────────────────────────────────

function Stat({ label, value, delta, better }: { label: string; value: string; delta?: string; better?: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
      {delta && (
        <span className={`text-xs font-medium ${better ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {delta}
        </span>
      )}
    </div>
  );
}

// ─── Mobile view ─────────────────────────────────────────────────────────────

function MobileMonitoring() {
  const [tab, setTab] = useState<MobileTab>('overview');
  const tabs: { id: MobileTab; label: string }[] = [
    { id: 'overview', label: 'Visão geral' },
    { id: 'crashes', label: 'Crashes' },
    { id: 'network', label: 'Rede' },
    { id: 'devices', label: 'Dispositivos' },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Stat label="Sessões/dia" value="18.4k" delta="+4%" better />
        <Stat label="Crash-free" value="98.7%" delta="+0.2%" better />
        <Stat label="Crashes" value="234" delta="+12" better={false} />
        <Stat label="ANR" value="18" delta="-3" better />
        <Stat label="DAU" value="6,420" delta="+8%" better />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sessões & Crashes — 24h</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={HOURS} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={30} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="sessions" name="Sessões" stroke="#3b82f6" fill="url(#sessGrad)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="crashes" name="Crashes" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Distribuição de plataformas</h3>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={DEVICE_SPLIT} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {DEVICE_SPLIT.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {DEVICE_SPLIT.map(d => (
                  <div key={d.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">{d.value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.value}%`, background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'crashes' && (
        <div className="card p-0">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top crashes por tipo</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {TOP_CRASHES.map(c => (
              <div key={c.type} className="flex items-center gap-4 px-4 py-3">
                <span className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                  c.platform === 'iOS'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                }`}>{c.platform}</span>
                <span className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300">{c.type}</span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">{c.count}</span>
                <span className="text-xs text-gray-400 tabular-nums">{c.users} users</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'network' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Latência de rede mobile — p50/p95</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={WEB_NETWORK} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={36} tickFormatter={v => `${v}ms`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}ms`, '']} />
              <Line type="monotone" dataKey="p50" name="p50" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" name="p95" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'devices' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Sessões por dispositivo</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              layout="vertical"
              data={[
                { name: 'iPhone 15 Pro', v: 2840 }, { name: 'Galaxy S24', v: 2340 },
                { name: 'iPhone 14', v: 1980 }, { name: 'Pixel 8', v: 1450 },
                { name: 'iPhone 13', v: 1230 }, { name: 'Xiaomi 13', v: 980 },
              ]}
              margin={{ top: 0, right: 12, bottom: 0, left: 90 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v.toLocaleString(), 'Sessões']} />
              <Bar dataKey="v" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Web view ─────────────────────────────────────────────────────────────────

const vitalStatus = (metric: string, value: number) => {
  if (metric === 'lcp') return value <= 2.5 ? 'good' : value <= 4 ? 'needs-improvement' : 'poor';
  if (metric === 'fid') return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
  if (metric === 'cls') return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
  return 'good';
};

const statusColor = (s: string) =>
  s === 'good' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' :
  s === 'needs-improvement' ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' :
  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';

const avgLCP = +(VITALS_TREND.reduce((s, d) => s + d.lcp, 0) / VITALS_TREND.length).toFixed(2);
const avgFID = Math.round(VITALS_TREND.reduce((s, d) => s + d.fid, 0) / VITALS_TREND.length);
const avgCLS = +(VITALS_TREND.reduce((s, d) => s + d.cls, 0) / VITALS_TREND.length).toFixed(3);

function WebMonitoring() {
  const [tab, setTab] = useState<WebTab>('vitals');
  const tabs: { id: WebTab; label: string }[] = [
    { id: 'vitals', label: 'Core Web Vitals' },
    { id: 'errors', label: 'JS Errors' },
    { id: 'performance', label: 'Performance' },
    { id: 'network', label: 'Rede' },
  ];

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <Stat label="LCP p75" value={`${avgLCP}s`} delta={avgLCP <= 2.5 ? 'Good' : 'Needs work'} better={avgLCP <= 2.5} />
        <Stat label="FID p75" value={`${avgFID}ms`} delta={avgFID <= 100 ? 'Good' : 'Needs work'} better={avgFID <= 100} />
        <Stat label="CLS p75" value={String(avgCLS)} delta={avgCLS <= 0.1 ? 'Good' : 'Needs work'} better={avgCLS <= 0.1} />
        <Stat label="JS Errors/h" value="24" delta="-8%" better />
        <Stat label="Page loads" value="9,840" delta="+5%" better />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'vitals' && (
        <div className="space-y-5">
          {/* Vital summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {([
              { key: 'lcp', label: 'LCP', value: `${avgLCP}s`, unit: 'Largest Contentful Paint', good: '≤2.5s', bad: '>4s' },
              { key: 'fid', label: 'FID', value: `${avgFID}ms`, unit: 'First Input Delay', good: '≤100ms', bad: '>300ms' },
              { key: 'cls', label: 'CLS', value: String(avgCLS), unit: 'Cumulative Layout Shift', good: '≤0.1', bad: '>0.25' },
            ] as const).map(v => {
              const s = vitalStatus(v.key, v.key === 'lcp' ? avgLCP : v.key === 'fid' ? avgFID : avgCLS);
              return (
                <div key={v.key} className="card text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{v.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{v.value}</p>
                  <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(s)}`}>
                    {s === 'good' ? 'Bom' : s === 'needs-improvement' ? 'Atenção' : 'Ruim'}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{v.unit}</p>
                </div>
              );
            })}
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">LCP ao longo do tempo</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={VITALS_TREND} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="lcpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={32} tickFormatter={v => `${v}s`} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}s`, 'LCP']} />
                <Area type="monotone" dataKey="lcp" stroke="#6366f1" fill="url(#lcpGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'errors' && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">JS Errors por hora</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={HOURS.slice(0, 12)} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={28} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="errors" name="Erros" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {(tab === 'performance' || tab === 'network') && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {tab === 'performance' ? 'Tempo de carregamento — p50/p95' : 'Latência de rede — p50/p95'}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={WEB_NETWORK} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={36} tickFormatter={v => `${v}ms`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}ms`, '']} />
              <Line type="monotone" dataKey="p50" name="p50" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="p95" name="p95" stroke="#f97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Backend view ─────────────────────────────────────────────────────────────

function BackendMonitoring() {
  const [tab, setTab] = useState<BackendTab>('system');
  const tabs: { id: BackendTab; label: string; icon: React.ReactNode }[] = [
    { id: 'system',   label: 'System Health', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'realtime', label: 'Real-Time',     icon: <Wifi className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'system'   && <SystemHealth />}
      {tab === 'realtime' && <RealTimeSystem />}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const CONTEXT_META: Record<ServiceContext, { label: string; icon: React.ReactNode; description: string }> = {
  backend: { label: 'Backend',  icon: <Server className="w-4 h-4" />,     description: 'System Health & Real-Time metrics' },
  mobile:  { label: 'Mobile',   icon: <Smartphone className="w-4 h-4" />, description: 'iOS & Android — crashes, sessões, rede' },
  web:     { label: 'Web',      icon: <Globe className="w-4 h-4" />,      description: 'Core Web Vitals, JS errors, performance' },
};

export const ServicesMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const match = useMatch('/services/:context');
  const context = (match?.params.context as ServiceContext) || 'backend';

  const setContext = (c: ServiceContext) => navigate(`/services/${c}`, { replace: true });

  return (
    <div className="space-y-5">
      {/* Context switcher */}
      <div className="flex gap-1.5">
        {(Object.entries(CONTEXT_META) as [ServiceContext, typeof CONTEXT_META[ServiceContext]][]).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setContext(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              context === key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {meta.icon}
            {meta.label}
          </button>
        ))}
      </div>

      {/* Content by context */}
      {context === 'backend' && <BackendMonitoring />}
      {context === 'mobile'  && <MobileMonitoring />}
      {context === 'web'     && <WebMonitoring />}
    </div>
  );
};
