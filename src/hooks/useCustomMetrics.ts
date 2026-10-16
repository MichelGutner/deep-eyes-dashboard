import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCustomMetric, deleteCustomMetric, fetchCustomMetrics,
  fetchMetricData, toggleCustomMetric, updateCustomMetric,
} from '../services/customMetricsService';

export function useCustomMetrics() {
  return useQuery({
    queryKey: ['custom-metrics'],
    queryFn: fetchCustomMetrics,
    staleTime: 60_000,
  });
}

export function useMetricData(id: string, timeRange = '1h') {
  return useQuery({
    queryKey: ['metric-data', id, timeRange],
    queryFn: () => fetchMetricData(id, timeRange),
    enabled: Boolean(id),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useCreateMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomMetric,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-metrics'] }),
  });
}

export function useUpdateMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, any>) => updateCustomMetric(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-metrics'] }),
  });
}

export function useToggleMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCustomMetric(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-metrics'] }),
  });
}

export function useDeleteMetric() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomMetric,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-metrics'] }),
  });
}
