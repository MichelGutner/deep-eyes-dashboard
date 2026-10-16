import api from './api';
import type { LogEntry } from '../components/AdvancedLogs';

export interface LogQueryFilters {
  level?: string;
  platform?: string;
  environment?: string;
  app?: string;
  search?: string;
  timeRange?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  total: number;
  logs: LogEntry[];
}

export interface LogMetric {
  level: string;
  sum: number;
}

export function normalizeStackTrace(stack: unknown): string | undefined {
  if (typeof stack === 'string' && stack.length > 0) return stack;
  if (Array.isArray(stack) && stack.length > 0) return stack.join('\n');
  return undefined;
}

export function normalizeTags(tags: unknown): Record<string, string> | undefined {
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return Object.fromEntries(tags.map((t: string) => [t, t]));
  }
  if (typeof tags === 'object') return tags as Record<string, string>;
  return undefined;
}

export function mapBackendLog(raw: Record<string, unknown>): LogEntry {
  const user = (raw.user ?? {}) as Record<string, unknown>;
  const error = (raw.error ?? {}) as Record<string, unknown>;
  const trace = (raw.trace ?? {}) as Record<string, unknown>;

  return {
    id: (raw._id as string) ?? String(raw.id ?? ''),
    timestamp: (raw.timestamp as string) ?? (raw['@timestamp'] as string),
    level: raw.level as LogEntry['level'],
    message: raw.message as string,
    app: (raw.app as string) ?? '',
    platform: (raw.platform as LogEntry['platform']) ?? 'other',
    release: raw.release as string | undefined,
    environment: raw.environment as string | undefined,
    fingerprint: raw.fingerprint as string | undefined,
    userId: user.id as string | undefined,
    sessionId: user.sessionId as string | undefined,
    userEmail: user.email as string | undefined,
    userIp: user.ip as string | undefined,
    errorType: error.name as string | undefined,
    stackTrace: normalizeStackTrace(error.stack),
    componentStack: error.componentStack as string | undefined,
    stackFrames: raw.stackFrames as LogEntry['stackFrames'],
    breadcrumbs: raw.breadcrumbs as LogEntry['breadcrumbs'],
    http: raw.http as LogEntry['http'],
    device: raw.device as LogEntry['device'],
    sdk: raw.sdk as LogEntry['sdk'],
    tags: normalizeTags(raw.tags),
    traceId: trace.traceId as string | undefined,
    spanId: trace.spanId as string | undefined,
    metadata: (raw.metadata ?? {}) as Record<string, unknown>,
  };
}

export async function fetchLogs(filters: LogQueryFilters = {}): Promise<LogsResponse> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await api.get<{ total: number; logs: Record<string, unknown>[] }>('/logs', { params });
  return {
    total: data.total,
    logs: data.logs.map(mapBackendLog),
  };
}

export async function fetchLogById(id: string): Promise<LogEntry | null> {
  const { data } = await api.get<Record<string, unknown> | null>(`/logs/${id}`);
  if (!data) return null;
  return mapBackendLog(data);
}

export async function fetchLogMetrics(timeRange?: string): Promise<LogMetric[]> {
  const { data } = await api.get<LogMetric[]>('/logs/metrics', {
    params: timeRange ? { timeRange } : undefined,
  });
  return data;
}
