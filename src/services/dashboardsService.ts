import api from './api';

export interface Widget {
  id: string;
  dashboardId: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
  posX: number;
  posY: number;
  width: number;
  height: number;
  isVisible: boolean;
  isLocked: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  isPublic: boolean;
  widgets: Widget[];
  created_at: string;
  updated_at: string;
}

export const fetchDashboards = () => api.get('/dashboards').then(r => r.data);
export const createDashboard = (body: { name: string; isPublic?: boolean }) => api.post('/dashboards', body).then(r => r.data);
export const updateDashboard = (id: string, body: Partial<Dashboard>) => api.put(`/dashboards/${id}`, body).then(r => r.data);
export const deleteDashboard = (id: string) => api.delete(`/dashboards/${id}`).then(r => r.data);
export const addWidget = (dashboardId: string, body: Partial<Widget>) => api.post(`/dashboards/${dashboardId}/widgets`, body).then(r => r.data);
export const updateWidget = (dashboardId: string, widgetId: string, body: Partial<Widget>) => api.put(`/dashboards/${dashboardId}/widgets/${widgetId}`, body).then(r => r.data);
export const deleteWidget = (dashboardId: string, widgetId: string) => api.delete(`/dashboards/${dashboardId}/widgets/${widgetId}`).then(r => r.data);
