import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAlertRules, fetchAlerts, patchAlert, patchAlertRule } from '../services/alertsService';

export function useAlerts(params?: { status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => fetchAlerts(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useAlertRules() {
  return useQuery({
    queryKey: ['alert-rules'],
    queryFn: fetchAlertRules,
    staleTime: 60_000,
  });
}

export function useUpdateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; assignedTo?: string }) =>
      patchAlert(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

export function useUpdateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      patchAlertRule(id, body as any),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alert-rules'] }),
  });
}
