import {
  AlertTriangle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Filter,
  Search,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMatch, useNavigate } from 'react-router-dom';
import { getLevelColors } from '../constants/colors';
import { useDrawer } from '../hooks/useDrawer';
import { useErrors } from '../hooks/useErrors';
import { useSavedFilters } from '../hooks/useSavedFilters';
import type { LogEntry, Platform } from './AdvancedLogs';
import { PLATFORM_META } from './AdvancedLogs';
import { LogDrawer } from './LogDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ErrorGroup {
  fingerprint: string;
  errorType: string;
  message: string;
  platforms: Platform[];
  apps: string[];
  count: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  level: 'error' | 'fatal';
  representative: LogEntry;
  hourly: number[];
}

interface ErrorFilter {
  level: ('error' | 'fatal')[];
  platform: Platform[];
  timeRange: { start: string; end: string };
  search: string;
  hasStackTrace: boolean;
  hasAffectedUsers: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildTrend(groups: ErrorGroup[]) {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, h) => ({
    label: `${String(new Date(now - (23 - h) * 3_600_000).getHours()).padStart(2, '0')}h`,
    errors: groups.reduce((s, g) => s + (g.hourly[h] ?? 0), 0),
    fatal: groups.filter(g => g.level === 'fatal').reduce((s, g) => s + (g.hourly[h] ?? 0), 0),
  }));
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m atrás`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atrás`;
  return `${Math.floor(diff / 86_400_000)}d atrás`;
}

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-6" style={{ width: 48 }}>
      {data.slice(-12).map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${Math.max(2, (v / max) * 100)}%`, background: v > 0 ? color : 'currentColor', opacity: v > 0 ? 0.8 : 0.15 }}
        />
      ))}
    </div>
  );
}

const DEFAULT_FILTER: ErrorFilter = {
  level: [],
  platform: [],
  timeRange: {
    start: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    end: new Date().toISOString(),
  },
  search: '',
  hasStackTrace: false,
  hasAffectedUsers: false,
};

const PLATFORMS: Platform[] = ['web', 'ios', 'android', 'backend'];

// ─── Component ────────────────────────────────────────────────────────────────

export const ErrorMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const match = useMatch('/errors/:logId');
  const logId = match?.params.logId;

  const drawer = useDrawer<LogEntry>();
  const [filter, setFilter] = useState<ErrorFilter>(DEFAULT_FILTER);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  const { saved: savedFilters, save: saveFilter, remove: removeSavedFilter } = useSavedFilters();
  const { data: errorsData, isLoading } = useErrors();
  const GROUPS = errorsData?.groups ?? [];
  const TREND = useMemo(() => buildTrend(GROUPS), [GROUPS]);

  // Sync URL param → drawer
  useEffect(() => {
    if (logId) {
      const group = GROUPS.find(g => g.representative?.id === logId);
      if (group) drawer.open(group.representative);
      else navigate('/errors', { replace: true });
    } else {
      drawer.close();
    }
  }, [logId, GROUPS]);

  const filtered = useMemo(() => {
    return GROUPS.filter(g => {
      if (filter.level.length > 0 && !filter.level.includes(g.level)) return false;
      if (filter.platform.length > 0 && !g.platforms.some(p => filter.platform.includes(p))) return false;
      const start = new Date(filter.timeRange.start).getTime();
      const end = new Date(filter.timeRange.end).getTime();
      const last = new Date(g.lastSeen).getTime();
      if (last < start || last > end) return false;
      if (filter.hasAffectedUsers && g.userCount === 0) return false;
      if (filter.hasStackTrace && !g.representative?.stackTrace && !g.representative?.stackFrames?.length) return false;
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return g.errorType.toLowerCase().includes(q) || g.message.toLowerCase().includes(q) || g.apps.some(a => a.toLowerCase().includes(q));
      }
      return true;
    });
  }, [filter, GROUPS]);

  const stats = useMemo(() => ({
    issues: filtered.length,
    events: filtered.reduce((s, g) => s + g.count, 0),
    users: filtered.reduce((s, g) => s + g.userCount, 0),
    fatal: filtered.filter(g => g.level === 'fatal').length,
  }), [filtered]);

  const activeFilterCount =
    filter.level.length + filter.platform.length +
    (filter.hasAffectedUsers ? 1 : 0) + (filter.hasStackTrace ? 1 : 0);

  const exportErrors = () => {
    const rows = [
      ['errorType', 'message', 'level', 'count', 'users', 'platforms', 'firstSeen', 'lastSeen'],
      ...filtered.map(g => [g.errorType, g.message, g.level, String(g.count), String(g.userCount), g.platforms.join('|'), g.firstSeen, g.lastSeen]),
    ].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'errors.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && GROUPS.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Carregando erros...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <LogDrawer
        log={drawer.data}
        isOpen={drawer.isOpen}
        onClose={() => navigate('/errors', { replace: true })}
        relatedLogs={[]}
      />

      <div className="space-y-3">
        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">Error Monitoring</h2>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Buscar por tipo, mensagem, app..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                showFilters
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800'
                  : 'btn-secondary'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="px-1 bg-primary-500 text-white rounded-full text-xs leading-none">{activeFilterCount}</span>
              )}
              {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => { setShowSaveDialog(v => !v); setSaveFilterName(''); }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium btn-secondary"
            >
              <Bookmark className="w-3 h-3" />
              <span>Save</span>
            </button>

            <button onClick={exportErrors} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium btn-primary">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Save filter dialog */}
        {showSaveDialog && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Bookmark className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <input
              autoFocus
              value={saveFilterName}
              onChange={e => setSaveFilterName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && saveFilterName.trim()) {
                  saveFilter(saveFilterName.trim(), {
                    level: filter.level.join(','),
                    platform: filter.platform.join(','),
                    search: filter.search,
                    hasError: filter.hasAffectedUsers ? '1' : '',
                    hasTraceId: filter.hasStackTrace ? '1' : '',
                  });
                  setShowSaveDialog(false);
                  setSaveFilterName('');
                }
                if (e.key === 'Escape') setShowSaveDialog(false);
              }}
              placeholder="Nome do filtro… (Enter para salvar)"
              className="flex-1 text-xs bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button onClick={() => setShowSaveDialog(false)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
          </div>
        )}

        {/* Saved filter chips */}
        {savedFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">Saved:</span>
            {savedFilters.map(sf => (
              <span
                key={sf.id}
                className="group inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-xs text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50"
                onClick={() => setFilter(f => ({
                  ...f,
                  level: (sf.filters.level ? sf.filters.level.split(',') : []) as ('error' | 'fatal')[],
                  platform: (sf.filters.platform ? sf.filters.platform.split(',') : []) as Platform[],
                  search: sf.filters.search ?? '',
                  hasAffectedUsers: sf.filters.hasError === '1',
                  hasStackTrace: sf.filters.hasTraceId === '1',
                }))}
              >
                {sf.name}
                <button onClick={e => { e.stopPropagation(); removeSavedFilter(sf.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs flex-wrap">
          {[
            { icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />, label: 'Issues', value: stats.issues, cls: 'font-semibold text-gray-900 dark:text-white' },
            { icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />, label: 'Eventos', value: stats.events, cls: 'font-semibold text-gray-900 dark:text-white' },
            { icon: <User className="w-3.5 h-3.5 text-purple-500" />, label: 'Usuários', value: stats.users, cls: 'font-semibold text-gray-900 dark:text-white' },
            { icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />, label: 'Fatais', value: stats.fatal, cls: 'font-semibold text-rose-600 dark:text-rose-400' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />}
              <div className="flex items-center gap-1.5">
                {s.icon}
                <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className={s.cls}>{s.value}</span>
              </div>
            </React.Fragment>
          ))}
          <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-600" />
          <div className="flex items-center gap-2">
            {(['error', 'fatal'] as const).map(lvl => (
              <span key={lvl} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: getLevelColors(lvl).bar }} />
                <span className="text-gray-400 dark:text-gray-500 capitalize">{lvl}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Collapsible filters panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Level */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nível</p>
                <div className="flex flex-wrap gap-1.5">
                  {(['error', 'fatal'] as const).map(level => {
                    const active = filter.level.includes(level);
                    const c = getLevelColors(level);
                    return (
                      <button
                        key={level}
                        onClick={() => setFilter(f => ({ ...f, level: active ? f.level.filter(l => l !== level) : [...f.level, level] }))}
                        className="text-xs px-2 py-0.5 rounded-full font-medium capitalize border transition-colors"
                        style={active
                          ? { background: c.bar, color: '#fff', borderColor: c.bar }
                          : { background: c.bar + '15', color: c.bar, borderColor: c.bar + '40' }
                        }
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Plataforma</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map(p => {
                    const active = filter.platform.includes(p);
                    const meta = PLATFORM_META[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setFilter(f => ({ ...f, platform: active ? f.platform.filter(x => x !== p) : [...f.platform, p] }))}
                        className="text-xs px-2 py-0.5 rounded-full font-medium border transition-colors"
                        style={active
                          ? { background: meta.color, color: '#fff', borderColor: meta.color }
                          : { background: meta.color + '15', color: meta.color, borderColor: meta.color + '40' }
                        }
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time range */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Período</p>
                <div className="space-y-1.5">
                  <input
                    type="datetime-local"
                    value={filter.timeRange.start.slice(0, 16)}
                    onChange={e => setFilter(f => ({ ...f, timeRange: { ...f.timeRange, start: e.target.value } }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <input
                    type="datetime-local"
                    value={filter.timeRange.end.slice(0, 16)}
                    onChange={e => setFilter(f => ({ ...f, timeRange: { ...f.timeRange, end: e.target.value } }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Outros */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Outros</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={filter.hasAffectedUsers} onChange={e => setFilter(f => ({ ...f, hasAffectedUsers: e.target.checked }))} className="rounded border-gray-300 dark:border-gray-600 text-primary-600 w-3 h-3" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Com usuários afetados</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={filter.hasStackTrace} onChange={e => setFilter(f => ({ ...f, hasStackTrace: e.target.checked }))} className="rounded border-gray-300 dark:border-gray-600 text-primary-600 w-3 h-3" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Com stack trace</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trend chart */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Eventos por hora — últimas 24h</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={TREND} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="errGradMon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fatalGradMon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#512082" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#512082" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={28} />
              <Tooltip contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: 12 }} labelFormatter={l => `Hora: ${l}`} />
              <Area type="monotone" dataKey="errors" name="Error" stroke="#ef4444" strokeWidth={1.5} fill="url(#errGradMon)" />
              <Area type="monotone" dataKey="fatal" name="Fatal" stroke="#512082" strokeWidth={1.5} fill="url(#fatalGradMon)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Issue list */}
        <div className="card overflow-hidden p-0">
          <div
            className="border-b border-gray-100 dark:border-gray-700 px-4 py-2.5 grid text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
            style={{ gridTemplateColumns: '1fr 60px 80px 60px 80px' }}
          >
            <span>Issue</span>
            <span className="text-center">Trend</span>
            <span className="text-center">Eventos</span>
            <span className="text-center">Usuários</span>
            <span className="text-right">Visto em</span>
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
              Nenhum issue encontrado com os filtros aplicados.
            </div>
          )}

          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {filtered.map(group => {
              const isFatal = group.level === 'fatal';
              const borderColor = isFatal ? '#be123c' : '#ef4444';
              const colors = getLevelColors(group.level);

              return (
                <div
                  key={group.fingerprint}
                  onClick={() => navigate('/errors/' + group.representative.id)}
                  className="px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors grid items-center gap-4"
                  style={{ gridTemplateColumns: '1fr 60px 80px 60px 80px', borderLeft: `3px solid ${borderColor}` }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold ${colors.badge}`}>
                        {group.errorType}
                      </span>
                      {group.platforms.map(p => {
                        const meta = PLATFORM_META[p];
                        return (
                          <span key={p} className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: meta.color + '18', color: meta.color }}>
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-100 font-medium truncate">{group.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {group.apps.map(a => <span key={a} className="text-xs text-gray-400 dark:text-gray-500 font-mono">{a}</span>)}
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        desde {relativeTime(group.firstSeen)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <MiniTrend data={group.hourly} color={borderColor} />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{group.count}</p>
                    <p className="text-xs text-gray-400">eventos</p>
                  </div>

                  <div className="text-center flex flex-col items-center gap-0.5">
                    {group.userCount > 0 ? (
                      <>
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{group.userCount}</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{relativeTime(group.lastSeen)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
