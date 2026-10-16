import api from './api';

export interface CustomMetric {
  id: string;
  name: string;
  description?: string;
  type: string;
  unit?: string;
  query: string;
  alertThreshold?: number;
  alertCondition?: string;
  chartType?: string;
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export async function fetchCustomMetrics(): Promise<{ total: number; metrics: CustomMetric[] }> {
  const { data } = await api.get('/custom-metrics');
  return data;
}

export async function createCustomMetric(body: Partial<CustomMetric>): Promise<CustomMetric> {
  const { data } = await api.post('/custom-metrics', body);
  return data;
}

export async function updateCustomMetric(id: string, body: Partial<CustomMetric>): Promise<CustomMetric> {
  const { data } = await api.put(`/custom-metrics/${id}`, body);
  return data;
}

export async function toggleCustomMetric(id: string, isActive: boolean): Promise<CustomMetric> {
  const { data } = await api.patch(`/custom-metrics/${id}`, { isActive });
  return data;
}

export async function deleteCustomMetric(id: string): Promise<void> {
  await api.delete(`/custom-metrics/${id}`);
}

export async function fetchMetricData(id: string, timeRange = '1h'): Promise<{ points: MetricDataPoint[] }> {
  const { data } = await api.get(`/custom-metrics/${id}/data`, { params: { timeRange } });
  return data;
}
