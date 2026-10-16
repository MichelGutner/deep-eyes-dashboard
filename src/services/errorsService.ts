import api from './api';
import { mapBackendLog } from './logsService';
import type { LogEntry, Platform } from '../components/AdvancedLogs';

export interface ErrorGroup {
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

interface RawErrorGroup extends Omit<ErrorGroup, 'representative'> {
  representative: Record<string, unknown>;
}

export interface ErrorsResponse {
  total: number;
  groups: ErrorGroup[];
}

export async function fetchErrors(timeRange = '7d', limit = 500): Promise<ErrorsResponse> {
  const { data } = await api.get<{ total: number; groups: RawErrorGroup[] }>('/errors', {
    params: { timeRange, limit },
  });
  return {
    total: data.total,
    groups: data.groups.map(g => ({
      ...g,
      representative: mapBackendLog(g.representative),
    })),
  };
}
