import api from './api';

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  description: string;
  created_at: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
  type: string;
  assignee?: string;
  reporter: string;
  affectedServices: string[];
  impact: string;
  rootCause?: string;
  resolution?: string;
  tags?: string[];
  automationStatus: 'manual' | 'automated' | 'semi_automated';
  resolvedAt?: string;
  created_at: string;
  updated_at: string;
  comments: IncidentComment[];
}

export async function fetchIncidents(params?: { status?: string; severity?: string }): Promise<{ total: number; incidents: Incident[] }> {
  const { data } = await api.get('/incidents', { params });
  return data;
}

export async function fetchIncident(id: string): Promise<Incident> {
  const { data } = await api.get(`/incidents/${id}`);
  return data;
}

export async function patchIncident(id: string, body: { status?: string; assignee?: string; rootCause?: string; resolution?: string }): Promise<Incident> {
  const { data } = await api.patch(`/incidents/${id}`, body);
  return data;
}

export async function addComment(incidentId: string, body: { userId: string; description: string }): Promise<IncidentComment> {
  const { data } = await api.post(`/incidents/${incidentId}/comments`, body);
  return data;
}
