import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addComment, fetchIncident, fetchIncidents, patchIncident } from '../services/incidentsService';

export function useIncidents(params?: { status?: string; severity?: string }) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => fetchIncidents(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => fetchIncident(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      patchIncident(id, body as any),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['incident', id] });
    },
  });
}

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, ...body }: { incidentId: string; userId: string; description: string }) =>
      addComment(incidentId, body),
    onSuccess: (_, { incidentId }) => {
      qc.invalidateQueries({ queryKey: ['incident', incidentId] });
      qc.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
