import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addWidget, createDashboard, deleteDashboard,
  deleteWidget, fetchDashboards, updateDashboard, updateWidget,
} from '../services/dashboardsService';

export function useDashboards() {
  return useQuery({
    queryKey: ['dashboards'],
    queryFn: fetchDashboards,
    staleTime: 30_000,
  });
}

export function useCreateDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDashboard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboards'] }),
  });
}

export function useUpdateDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, any>) => updateDashboard(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboards'] }),
  });
}

export function useDeleteDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDashboard,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboards'] }),
  });
}

export function useAddWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dashboardId, ...body }: { dashboardId: string } & Record<string, any>) => addWidget(dashboardId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboards'] }),
  });
}

export function useUpdateWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dashboardId, widgetId, ...body }: { dashboardId: string; widgetId: string } & Record<string, any>) => updateWidget(dashboardId, widgetId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboards'] }),
  });
}

export function useDeleteWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dashboardId, widgetId }: { dashboardId: string; widgetId: string }) => deleteWidget(dashboardId, widgetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboards'] }),
  });
}
