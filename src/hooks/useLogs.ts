import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchLogs, fetchLogById, fetchLogMetrics } from '../services/logsService';
import type { LogQueryFilters } from '../services/logsService';

export function useLogs(filters: LogQueryFilters = {}) {
  return useQuery({
    queryKey: ['logs', filters],
    queryFn: () => fetchLogs(filters),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useLogById(id: string | undefined) {
  return useQuery({
    queryKey: ['log', id],
    queryFn: () => fetchLogById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useLogMetrics(timeRange?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['log-metrics', timeRange],
    queryFn: () => fetchLogMetrics(timeRange),
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: options?.enabled ?? true,
  });
}

export function useInfiniteLogs(filters: LogQueryFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['logs-infinite', filters],
    queryFn: ({ pageParam = 0 }) => fetchLogs({ ...filters, limit: 50, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.logs.length, 0);
      return lastPage.logs.length === 50 ? loaded : undefined;
    },
    staleTime: 30_000,
  });
}
