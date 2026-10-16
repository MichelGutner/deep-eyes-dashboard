import api from './api';

export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  assignedTo?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: { email: boolean; slack: boolean; webhook: boolean };
  created_at: string;
  updated_at: string;
}

export async function fetchAlerts(params?: { status?: string; severity?: string }): Promise<{ total: number; alerts: Alert[] }> {
  const { data } = await api.get('/alerts', { params });
  return data;
}

export async function patchAlert(id: string, body: { status?: string; assignedTo?: string }): Promise<Alert> {
  const { data } = await api.patch(`/alerts/${id}`, body);
  return data;
}

export async function fetchAlertRules(): Promise<{ total: number; rules: AlertRule[] }> {
  const { data } = await api.get('/alerts/rules');
  return data;
}

export async function patchAlertRule(id: string, body: Partial<AlertRule>): Promise<AlertRule> {
  const { data } = await api.patch(`/alerts/rules/${id}`, body);
  return data;
}
