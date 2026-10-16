import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  Download,
  ExternalLink,
  Globe,
  Monitor,
  MousePointer,
  Terminal,
  X,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getLevelColors } from '../constants/colors';
import type { Breadcrumb, BreadcrumbType, LogEntry, Platform, StackFrame } from './AdvancedLogs';

// ─── Platform labels ───────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<Platform, string> = {
  web: 'Web', ios: 'iOS', android: 'Android', backend: 'Backend', other: 'Other',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  accentColor?: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, accentColor = '#6b7280', count, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-700">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left"
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accentColor }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex-1">
          {title}
        </span>
        {count !== undefined && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">{count}</span>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
};

const KV: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}> = ({ label, value, mono, clickable, onClick }) => (
  <div className="flex items-start gap-3 py-0.5">
    <span className="w-32 flex-shrink-0 text-xs text-gray-400 dark:text-gray-500 pt-0.5">{label}</span>
    <span
      className={`flex-1 text-xs break-all ${mono ? 'font-mono' : ''} ${
        clickable
          ? 'text-blue-500 dark:text-blue-400 cursor-pointer hover:underline'
          : 'text-gray-800 dark:text-gray-200'
      }`}
      onClick={clickable ? onClick : undefined}
    >
      {value ?? <span className="text-gray-300 dark:text-gray-600">—</span>}
    </span>
  </div>
);

// ─── Stack Frames ─────────────────────────────────────────────────────────────

const StackFrameRow: React.FC<{ frame: StackFrame; index: number }> = ({ frame, index }) => {
  const [expanded, setExpanded] = useState(index === 0 && frame.in_app);
  const hasContext = frame.context_line || frame.pre_context || frame.post_context;

  return (
    <div className={`border rounded-md mb-1.5 overflow-hidden ${
      frame.in_app
        ? 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
        : 'border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30'
    }`}>
      <button
        onClick={() => hasContext && setExpanded(v => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left ${hasContext ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className={`text-xs font-mono flex-1 truncate ${
          frame.in_app ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
        }`}>
          <span className={frame.in_app ? 'text-blue-500 dark:text-blue-400' : ''}>
            {frame.filename.split('/').pop()}
          </span>
          <span className="text-gray-400 dark:text-gray-600 mx-1">in</span>
          <span className={frame.in_app ? 'font-semibold' : ''}>{frame.function}</span>
          {frame.lineno != null && (
            <span className="text-gray-400 dark:text-gray-500 ml-1">:{frame.lineno}{frame.colno != null ? `:${frame.colno}` : ''}</span>
          )}
        </span>
        {frame.module && (
          <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0">{frame.module}</span>
        )}
        {!frame.in_app && (
          <span className="text-xs text-gray-300 dark:text-gray-600 flex-shrink-0">vendor</span>
        )}
        {hasContext && (expanded
          ? <ChevronUp className="w-3 h-3 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {expanded && hasContext && (
        <div className="bg-gray-950 text-xs font-mono leading-5 overflow-x-auto">
          {frame.pre_context?.map((line, i) => (
            <div key={i} className="px-3 py-0.5 text-gray-500">{line || ' '}</div>
          ))}
          {frame.context_line != null && (
            <div className="px-3 py-0.5 bg-red-900/30 text-red-300 flex items-start gap-2">
              <span className="text-red-600 flex-shrink-0 select-none">→</span>
              <span>{frame.context_line}</span>
            </div>
          )}
          {frame.post_context?.map((line, i) => (
            <div key={i} className="px-3 py-0.5 text-gray-500">{line || ' '}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const CRUMB_ICON: Record<BreadcrumbType, React.ReactNode> = {
  navigation: <ArrowRight className="w-3 h-3" />,
  http:       <Globe className="w-3 h-3" />,
  ui:         <MousePointer className="w-3 h-3" />,
  console:    <Terminal className="w-3 h-3" />,
  error:      <Zap className="w-3 h-3" />,
  query:      <Database className="w-3 h-3" />,
  lifecycle:  <Monitor className="w-3 h-3" />,
};

const CRUMB_COLOR: Record<BreadcrumbType, string> = {
  navigation: '#3b82f6',
  http:       '#8b5cf6',
  ui:         '#10b981',
  console:    '#6b7280',
  error:      '#ef4444',
  query:      '#f59e0b',
  lifecycle:  '#06b6d4',
};

function crumbLevelColor(level?: Breadcrumb['level']) {
  if (level === 'error') return 'text-red-500 dark:text-red-400';
  if (level === 'warn') return 'text-yellow-500 dark:text-yellow-400';
  return 'text-gray-500 dark:text-gray-400';
}

const BreadcrumbRow: React.FC<{ crumb: Breadcrumb; isLast: boolean }> = ({ crumb, isLast }) => {
  const color = CRUMB_COLOR[crumb.type];
  const time = new Date(crumb.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
  });

  return (
    <div className={`flex gap-3 items-start py-1 ${isLast ? '' : 'border-b border-gray-50 dark:border-gray-700/40'}`}>
      {/* Icon + vertical line */}
      <div className="flex flex-col items-center flex-shrink-0 w-6 pt-0.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: color + '20', color }}>
          {CRUMB_ICON[crumb.type]}
        </div>
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: color + '30', minHeight: 8 }} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0">{time}</span>
          <span className="text-xs px-1 py-0 rounded font-medium"
            style={{ background: color + '15', color }}>
            {crumb.category}
          </span>
        </div>
        <p className={`text-xs mt-0.5 font-mono break-all ${crumbLevelColor(crumb.level)}`}>
          {crumb.message}
        </p>
        {crumb.data && Object.keys(crumb.data).length > 0 && (
          <div className="flex flex-wrap gap-x-3 mt-0.5">
            {crumb.data.status_code !== undefined && (
              <span className={`text-xs font-mono ${
                Number(crumb.data.status_code) >= 400 ? 'text-red-500' : Number(crumb.data.status_code) >= 300 ? 'text-yellow-500' : 'text-gray-400'
              }`}>{crumb.data.status_code}</span>
            )}
            {crumb.data.duration_ms !== undefined && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{crumb.data.duration_ms}ms</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Component stack (collapsed preview + modal) ───────────────────────────────

const COMPONENT_STACK_PREVIEW_LINES = 3;

const ComponentStackPreview: React.FC<{ stack: string; onExpand: () => void }> = ({ stack, onExpand }) => {
  const lines = stack.split('\n').map(l => l.trim()).filter(Boolean);
  const preview = lines.slice(0, COMPONENT_STACK_PREVIEW_LINES);
  const remaining = lines.length - preview.length;

  return (
    <div className="mt-3">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Component Stack (React)</p>
      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 text-xs font-mono leading-5 overflow-x-auto">
        {preview.map((line, i) => (
          <div key={i} className={i === 0 ? 'text-purple-400 font-medium' : 'text-gray-400'}>{line}</div>
        ))}
      </div>
      {remaining > 0 && (
        <button
          onClick={onExpand}
          className="mt-1.5 text-xs text-blue-500 dark:text-blue-400 hover:underline"
        >
          Ver stack completo (+{remaining} {remaining === 1 ? 'linha' : 'linhas'}) →
        </button>
      )}
    </div>
  );
};

const StackTraceModal: React.FC<{
  title: string;
  content: string;
  onClose: () => void;
}> = ({ title, content, onClose }) => {
  const { t } = useTranslation();

  const copy = () => {
    navigator.clipboard.writeText(content);
    toast.success(t('log_copied_to_clipboard'));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <div className="flex items-center gap-1">
            <button onClick={copy} title="Copiar"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button onClick={onClose} title="Fechar"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 text-xs font-mono leading-5 overflow-x-auto">
            {content.split('\n').map((line, i) => (
              <div key={i} className={i === 0 ? 'text-purple-400 font-medium' : 'text-gray-400'}>{line.trim() || ' '}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main drawer ──────────────────────────────────────────────────────────────

interface LogDrawerProps {
  log: LogEntry | null;
  isOpen: boolean;
  onClose: () => void;
  relatedLogs?: LogEntry[];
  onNavigateToTrace?: (traceId: string) => void;
}

function statusColor(code?: number) {
  if (!code) return 'text-gray-500';
  if (code < 300) return 'text-green-600 dark:text-green-400';
  if (code < 500) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

/** Human-readable label for how this error reached us — the "de onde veio" signal. */
function crashKindLabel(log: LogEntry): string | null {
  const tags = log.tags ? Object.keys(log.tags) : [];
  if (tags.includes('native-crash')) {
    const kind = log.metadata?.nativeCrashType ?? tags.find(t => t !== 'native-crash');
    return `Crash nativo${kind ? ` (${kind})` : ''} — processo morreu`;
  }
  if (tags.includes('possible-oom')) {
    const rss = log.metadata?.memoryRssKb;
    const rssLabel = typeof rss === 'number' ? ` usando ~${Math.round(rss / 1024)}MB` : '';
    return `Provável falta de memória: app encerrado sem aviso${rssLabel}`;
  }
  if (tags.includes('anr')) return 'ANR — thread principal travada (app não crashou)';
  if (log.componentStack) return 'Erro de renderização (React ErrorBoundary)';
  if (log.level === 'fatal') return 'Não tratado (JS)';
  if (log.level === 'error') return 'Tratado (capturado)';
  return null;
}

function formatBytes(mb?: number): string {
  if (mb == null) return '—';
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

/** Builds the full human-readable incident report — same data as "Copiar JSON" but organized to read top-to-bottom like an incident report instead of a raw object dump. */
function buildTextReport(log: LogEntry): string {
  const lines: string[] = [];
  const hr = () => lines.push('─'.repeat(72));
  const section = (title: string) => { lines.push(''); lines.push(`## ${title}`); hr(); };

  lines.push(`DEEP EYES — RELATÓRIO DE ERRO`);
  lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
  hr();

  section('RESUMO');
  lines.push(`Nível:        ${log.level.toUpperCase()}`);
  const kind = crashKindLabel(log);
  if (kind) lines.push(`Tipo:         ${kind}`);
  lines.push(`Mensagem:     ${log.message}`);
  if (log.errorType) lines.push(`Tipo de erro: ${log.errorType}`);
  lines.push(`App:          ${log.app} (${log.platform})`);
  if (log.release) lines.push(`Release:      ${log.release}`);
  if (log.environment) lines.push(`Ambiente:     ${log.environment}`);
  lines.push(`Timestamp:    ${new Date(log.timestamp).toLocaleString('pt-BR')} (${log.timestamp})`);
  if (log.fingerprint) lines.push(`Fingerprint:  ${log.fingerprint}`);
  if (log.duration != null) lines.push(`Duração:      ${log.duration}ms`);

  if (log.stackFrames?.length || log.stackTrace) {
    section('STACK TRACE');
    if (log.stackFrames?.length) {
      log.stackFrames.forEach((f, i) => {
        lines.push(`${i}. ${f.in_app ? '[app]' : '[vendor]'} ${f.function} — ${f.filename}${f.lineno != null ? `:${f.lineno}${f.colno != null ? `:${f.colno}` : ''}` : ''}`);
        if (f.context_line) lines.push(`     → ${f.context_line}`);
      });
    } else if (log.stackTrace) {
      lines.push(log.stackTrace);
    }
  }

  if (log.componentStack) {
    section('REACT COMPONENT STACK');
    lines.push(log.componentStack.trim());
  }

  if (log.breadcrumbs?.length) {
    section(`LINHA DO TEMPO — passo a passo até o erro (${log.breadcrumbs.length} eventos)`);
    log.breadcrumbs.forEach((c, i) => {
      const time = new Date(c.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
      lines.push(`${i + 1}. [${time}] (${c.type}/${c.category}) ${c.message}`);
      if (c.data && Object.keys(c.data).length > 0) {
        lines.push(`     ${JSON.stringify(c.data)}`);
      }
    });
  }

  if (log.userId || log.userEmail || log.sessionId || log.userIp) {
    section('USUÁRIO');
    if (log.userId) lines.push(`ID:         ${log.userId}`);
    if (log.userEmail) lines.push(`Email:      ${log.userEmail}`);
    if (log.userIp) lines.push(`IP:         ${log.userIp}`);
    if (log.sessionId) lines.push(`Session ID: ${log.sessionId}`);
  }

  if (log.http && (log.http.method || log.http.url)) {
    section('CONTEXTO HTTP');
    if (log.http.method || log.http.url) lines.push(`${log.http.method ?? ''} ${log.http.url ?? ''}`.trim());
    if (log.http.statusCode != null) lines.push(`Status:         ${log.http.statusCode}`);
    if (log.http.responseTime != null) lines.push(`Response Time:  ${log.http.responseTime}ms`);
    if (log.http.bodySize != null) lines.push(`Body Size:      ${log.http.bodySize} bytes`);
    if (log.http.headers) {
      lines.push('Headers:');
      Object.entries(log.http.headers).forEach(([k, v]) => lines.push(`  ${k}: ${v}`));
    }
  }

  if (log.device && Object.values(log.device).some(v => v !== undefined && v !== null)) {
    section('DISPOSITIVO / AMBIENTE');
    const d = log.device;
    if (d.model) lines.push(`Modelo:          ${d.model}${d.brand ? ` (${d.brand})` : ''}`);
    if (d.manufacturer) lines.push(`Fabricante:      ${d.manufacturer}`);
    if (d.os) lines.push(`SO:              ${d.os} ${d.osVersion ?? ''}`.trim());
    if (d.appVersion) lines.push(`Versão do app:   ${d.appVersion}`);
    if (d.arch) lines.push(`Arquitetura:     ${d.arch}`);
    if (d.deviceId) lines.push(`Device ID:       ${d.deviceId}`);
    if (d.simulator !== undefined) lines.push(`Simulador:       ${d.simulator ? 'Sim' : 'Não'}`);
    if (d.rooted !== undefined) lines.push(`Root/Jailbreak:  ${d.rooted ? 'Sim' : 'Não'}`);
    if (d.screenResolution) lines.push(`Tela:            ${d.screenResolution}${d.screenDensity ? ` @${d.screenDensity}x` : ''} (${d.orientation ?? '—'})`);
    if (d.memoryMb != null) lines.push(`Memória:         ${formatBytes(d.memoryMb)} total, ${formatBytes(d.freeMemoryMb)} livre`);
    if (d.totalStorageMb != null) lines.push(`Armazenamento:   ${formatBytes(d.totalStorageMb)} total, ${formatBytes(d.freeStorageMb)} livre`);
    if (d.battery != null) lines.push(`Bateria:         ${Math.round(d.battery <= 1 ? d.battery * 100 : d.battery)}% (${d.batteryState ?? 'unknown'})`);
    if (d.online !== undefined) lines.push(`Online:          ${d.online ? 'Sim' : 'Não'}${d.networkType ? ` (${d.networkType})` : ''}`);
    if (d.carrier) lines.push(`Operadora:       ${d.carrier}`);
    if (d.ipAddress) lines.push(`IP:              ${d.ipAddress}`);
    if (d.locale) lines.push(`Locale:          ${d.locale}`);
    if (d.timezone) lines.push(`Timezone:        ${d.timezone}`);
  }

  if (log.traceId || log.spanId) {
    section('RASTREAMENTO');
    if (log.traceId) lines.push(`Trace ID: ${log.traceId}`);
    if (log.spanId) lines.push(`Span ID:  ${log.spanId}`);
  }

  if (log.tags && Object.keys(log.tags).length > 0) {
    section('TAGS');
    Object.entries(log.tags).forEach(([k, v]) => lines.push(`${k}: ${v}`));
  }

  if (log.sdk) {
    section('SDK');
    lines.push(`${log.sdk.name}@${log.sdk.version}`);
    if (log.sdk.integrations?.length) lines.push(`Integrações: ${log.sdk.integrations.join(', ')}`);
  }

  if (log.metadata && Object.keys(log.metadata).length > 0) {
    section('METADATA');
    Object.entries(log.metadata).forEach(([k, v]) => lines.push(`${k}: ${String(v)}`));
  }

  lines.push('');
  hr();
  lines.push('JSON BRUTO');
  hr();
  lines.push(JSON.stringify(log, null, 2));

  return lines.join('\n');
}

export const LogDrawer: React.FC<LogDrawerProps> = ({ log, isOpen, onClose, relatedLogs = [], onNavigateToTrace }) => {
  const { t } = useTranslation();

  const copyJson = () => {
    if (!log) return;
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    toast.success(t('log_copied_to_clipboard'));
  };

  const downloadTxt = () => {
    if (!log) return;
    const text = buildTextReport(log);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepeyes-error-${log.fingerprint ?? log.id}-${new Date(log.timestamp).toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Log baixado');
  };

  const colors = log ? getLevelColors(log.level) : getLevelColors('info');
  const crashKind = log ? crashKindLabel(log) : null;
  const [stackModalOpen, setStackModalOpen] = useState(false);

  return (
    <>
      {stackModalOpen && log?.componentStack && (
        <StackTraceModal
          title="Component Stack (React) — completo"
          content={log.componentStack}
          onClose={() => setStackModalOpen(false)}
        />
      )}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        style={{ width: '480px' }}
        className={`fixed top-0 right-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {log && (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${colors.badge}`}>
                  {log.level}
                </span>
                <span className="flex-1 min-w-0 font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {log.errorType ?? log.app}
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={downloadTxt} title="Baixar log completo (.txt)"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={copyJson} title="Copiar JSON"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  {log.traceId && onNavigateToTrace && (
                    <button onClick={() => onNavigateToTrace(log.traceId!)} title="Ver Trace"
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={onClose} title="Fechar"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {crashKind && (
                <p className={`mt-1.5 text-xs truncate ${
                  log.metadata?.confidence === 'heuristic'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-purple-600 dark:text-purple-400'
                }`}>{crashKind}</p>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Exception ── */}
              {(log.errorType || log.stackFrames) && (
                <Section title="Exception" accentColor="#ef4444">
                  <div className={`rounded-lg p-3 mb-3 border-l-4 bg-gray-50 dark:bg-gray-900 ${colors.border}`}>
                    {log.errorType && (
                      <p className="text-xs font-mono font-semibold text-red-600 dark:text-red-400 mb-1">{log.errorType}</p>
                    )}
                    <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{log.message}</p>
                  </div>

                  {log.stackFrames && log.stackFrames.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                        {log.stackFrames.filter(f => f.in_app).length} frames da aplicação · {log.stackFrames.filter(f => !f.in_app).length} vendor
                      </p>
                      {log.stackFrames.map((frame, i) => (
                        <StackFrameRow key={i} frame={frame} index={i} />
                      ))}
                    </div>
                  )}

                  {/* Raw stack trace fallback */}
                  {!log.stackFrames && log.stackTrace && (
                    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-3 text-xs font-mono leading-5 overflow-x-auto">
                      {log.stackTrace.split('\n').map((line, i) => (
                        <div key={i} className={i === 0 ? 'text-red-400 font-medium' : 'text-gray-400'}>{line}</div>
                      ))}
                    </div>
                  )}

                  {/* React component stack — exactly which component was rendering when it crashed */}
                  {log.componentStack && (
                    <ComponentStackPreview stack={log.componentStack} onExpand={() => setStackModalOpen(true)} />
                  )}
                </Section>
              )}

              {/* ── Breadcrumbs ── */}
              {log.breadcrumbs && log.breadcrumbs.length > 0 && (
                <Section title="Breadcrumbs" accentColor="#f59e0b" count={log.breadcrumbs.length} defaultOpen={false}>
                  <div className="pt-1">
                    {log.breadcrumbs.map((crumb, i) => (
                      <BreadcrumbRow key={i} crumb={crumb} isLast={i === log.breadcrumbs!.length - 1} />
                    ))}
                  </div>
                </Section>
              )}

              {/* ── Overview ── */}
              <Section title="Visão Geral" accentColor={colors.bar}>
                <KV label="App" value={
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-700 dark:text-gray-300">
                    {log.app}
                  </span>
                } />
                <KV label="Plataforma" value={PLATFORM_LABELS[log.platform]} />
                <KV label="Release" value={log.release} mono />
                <KV label="Ambiente" value={log.environment && (
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    log.environment === 'production'
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>{log.environment}</span>
                )} />
                <KV label="Timestamp" value={new Date(log.timestamp).toLocaleString('pt-BR')} />
                {log.duration != null && (
                  <KV label="Duração" value={
                    <span className={log.duration > 1000 ? 'text-red-500 dark:text-red-400 font-semibold' : ''}>
                      {log.duration}ms
                    </span>
                  } />
                )}
                {log.fingerprint && (
                  <KV label="Fingerprint" value={log.fingerprint} mono />
                )}
              </Section>

              {/* ── User ── */}
              {(log.userId || log.userEmail || log.sessionId) && (
                <Section title="Usuário" accentColor="#3b82f6">
                  {log.userId && <KV label="User ID" value={log.userId} mono />}
                  {log.userEmail && <KV label="Email" value={log.userEmail} />}
                  {log.userIp && <KV label="IP" value={log.userIp} mono />}
                  {log.sessionId && <KV label="Session ID" value={log.sessionId} mono />}
                </Section>
              )}

              {/* ── Rastreamento ── */}
              {(log.traceId || log.spanId) && (
                <Section title="Rastreamento" accentColor="#6366f1">
                  {log.traceId && (
                    <KV label="Trace ID" value={log.traceId} mono
                      clickable={!!onNavigateToTrace} onClick={() => onNavigateToTrace?.(log.traceId!)} />
                  )}
                  {log.spanId && <KV label="Span ID" value={log.spanId} mono />}
                </Section>
              )}

              {/* ── HTTP Context ── */}
              {log.http && (log.http.method || log.http.url) && (
                <Section title="Contexto HTTP" accentColor="#a78bfa">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {log.http.method && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-mono">
                        {log.http.method}
                      </span>
                    )}
                    {log.http.url && (
                      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">{log.http.url}</span>
                    )}
                    {log.http.statusCode && (
                      <span className={`text-xs font-bold font-mono ${statusColor(log.http.statusCode)}`}>
                        {log.http.statusCode}
                      </span>
                    )}
                  </div>
                  {log.http.responseTime != null && <KV label="Response Time" value={`${log.http.responseTime}ms`} mono />}
                  {log.http.queryString && <KV label="Query String" value={log.http.queryString} mono />}
                  {log.http.bodySize != null && <KV label="Body Size" value={`${log.http.bodySize} bytes`} mono />}
                  {log.http.headers && Object.keys(log.http.headers).length > 0 && (
                    <div className="mt-1.5">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Headers</p>
                      {Object.entries(log.http.headers).map(([k, v]) => (
                        <KV key={k} label={k} value={v} mono />
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* ── Device / Environment ── */}
              {log.device && Object.values(log.device).some(v => v !== undefined && v !== null) && (
                <Section title="Dispositivo / Ambiente" accentColor="#10b981">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 mt-1">Identidade</p>
                  {log.device.model && <KV label="Modelo" value={log.device.model} mono />}
                  {log.device.brand && <KV label="Marca" value={log.device.brand} />}
                  {log.device.manufacturer && <KV label="Fabricante" value={log.device.manufacturer} />}
                  {log.device.os && (
                    <KV label="SO" value={`${log.device.os}${log.device.osVersion ? ` ${log.device.osVersion}` : ''}`} />
                  )}
                  {log.device.browser && (
                    <KV label="Navegador" value={`${log.device.browser}${log.device.browserVersion ? ` ${log.device.browserVersion}` : ''}`} />
                  )}
                  {log.device.appVersion && <KV label="Versão do App" value={log.device.appVersion} mono />}
                  {log.device.arch && <KV label="Arquitetura" value={log.device.arch} mono />}
                  {log.device.deviceId && <KV label="Device ID" value={log.device.deviceId} mono />}
                  {log.device.simulator !== undefined && (
                    <KV label="Simulador/Emulador" value={
                      <span className={log.device.simulator ? 'text-yellow-500 dark:text-yellow-400 font-medium' : ''}>
                        {log.device.simulator ? 'Sim' : 'Não'}
                      </span>
                    } />
                  )}
                  {log.device.rooted !== undefined && (
                    <KV label="Root/Jailbreak" value={
                      <span className={log.device.rooted ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                        {log.device.rooted ? 'Sim' : 'Não'}
                      </span>
                    } />
                  )}

                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 mt-3">Tela</p>
                  {log.device.screenResolution && <KV label="Resolução" value={log.device.screenResolution} mono />}
                  {log.device.screenDensity != null && <KV label="Densidade" value={`${log.device.screenDensity}x`} mono />}
                  {log.device.orientation && <KV label="Orientação" value={log.device.orientation} />}

                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 mt-3">Memória / Armazenamento</p>
                  {log.device.memoryMb != null && (
                    <KV label="Memória RAM" value={
                      `${(log.device.memoryMb / 1024).toFixed(1)} GB total` +
                      (log.device.freeMemoryMb != null ? ` · ${(log.device.freeMemoryMb / 1024).toFixed(1)} GB livre` : '')
                    } mono />
                  )}
                  {log.device.totalStorageMb != null && (
                    <KV label="Armazenamento" value={
                      `${(log.device.totalStorageMb / 1024).toFixed(1)} GB total` +
                      (log.device.freeStorageMb != null ? ` · ${(log.device.freeStorageMb / 1024).toFixed(1)} GB livre` : '')
                    } mono />
                  )}

                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 mt-3">Bateria</p>
                  {log.device.battery != null && (
                    <KV label="Nível" value={(() => {
                      const pct = log.device.battery! <= 1 ? Math.round(log.device.battery! * 100) : Math.round(log.device.battery!);
                      return <span className={pct < 20 ? 'text-red-500 font-medium' : ''}>{pct}%</span>;
                    })()} />
                  )}
                  {log.device.batteryState && <KV label="Estado" value={log.device.batteryState} />}

                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 mt-3">Conexão</p>
                  {log.device.online !== undefined && (
                    <KV label="Online" value={
                      <span className={!log.device.online ? 'text-red-500 dark:text-red-400 font-medium' : 'text-green-600 dark:text-green-400'}>
                        {log.device.online ? 'Sim' : 'Não'}
                      </span>
                    } />
                  )}
                  {log.device.networkType && <KV label="Tipo de rede" value={log.device.networkType} />}
                  {log.device.carrier && <KV label="Operadora" value={log.device.carrier} />}
                  {log.device.ipAddress && <KV label="IP" value={log.device.ipAddress} mono />}

                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1 mt-3">Regional</p>
                  {log.device.locale && <KV label="Locale" value={log.device.locale} mono />}
                  {log.device.timezone && <KV label="Timezone" value={log.device.timezone} mono />}
                </Section>
              )}

              {/* ── Tags ── */}
              {log.tags && Object.keys(log.tags).length > 0 && (
                <Section title="Tags" accentColor="#6b7280" defaultOpen={false}>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(log.tags).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                        <span className="text-gray-500 dark:text-gray-400">{k}:</span>
                        <span className="text-gray-800 dark:text-gray-200">{v}</span>
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* ── SDK ── */}
              {log.sdk && (
                <Section title="SDK" accentColor="#6b7280" defaultOpen={false}>
                  <KV label="Nome" value={log.sdk.name} mono />
                  <KV label="Versão" value={log.sdk.version} mono />
                  {log.sdk.integrations && (
                    <KV label="Integrações" value={log.sdk.integrations.join(', ')} />
                  )}
                </Section>
              )}

              {/* ── Metadata ── */}
              {Object.keys(log.metadata).length > 0 && (
                <Section title="Metadata" accentColor="#6b7280" defaultOpen={false}>
                  {Object.entries(log.metadata).map(([k, v]) => (
                    <KV key={k} label={k} value={String(v)} mono />
                  ))}
                </Section>
              )}

              {/* ── Related Logs ── */}
              {relatedLogs.length > 0 && (
                <Section title={`Mesmo Trace`} accentColor="#f59e0b" count={relatedLogs.length} defaultOpen={false}>
                  <div className="space-y-1 pt-1">
                    {relatedLogs.map(related => {
                      const rc = getLevelColors(related.level);
                      return (
                        <div key={related.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer transition-colors">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: rc.bar }} />
                          <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{related.message}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0 font-mono">
                            {new Date(related.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              <div className="h-6" />
            </div>
          </>
        )}
      </div>
    </>
  );
};
