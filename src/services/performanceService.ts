import api from './api';

export interface PerformanceSnapshot {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  endpoints: Array<{
    path: string;
    method: string;
    avgResponseTime: number;
    count: number;
    errorCount: number;
  }>;
}

export async function fetchPerformance(timeRange = '1h'): Promise<PerformanceSnapshot> {
  const { data } = await api.get<PerformanceSnapshot>('/performance', { params: { timeRange } });
  return data;
}
