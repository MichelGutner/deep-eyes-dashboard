import api from './api';

export interface SecurityEventRaw {
  id: string;
  timestamp: string;
  type: 'access_denied' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
  action: string;
  resource: string;
  status: 'investigating' | 'resolved' | 'false_positive';
}

export interface SecurityResponse {
  events: SecurityEventRaw[];
}

export async function fetchSecurity(timeRange = '24h'): Promise<SecurityResponse> {
  const { data } = await api.get<SecurityResponse>('/security', { params: { timeRange } });
  return data;
}
