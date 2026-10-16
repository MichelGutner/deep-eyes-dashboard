import api from './api';

export interface RealtimeSnapshot {
  activeUsers: number;
  requestsPerMin: number;
  errorsLastMinute: number;
  avgResponseTime: number;
  events: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
    app: string;
    platform: string;
  }>;
}

export async function fetchRealtime(): Promise<RealtimeSnapshot> {
  const { data } = await api.get<RealtimeSnapshot>('/realtime');
  return data;
}

export function createRealtimeStream(onMessage: (data: RealtimeSnapshot) => void): () => void {
  const es = new EventSource('http://localhost:3000/realtime/stream');
  es.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch { /* ignore parse errors */ }
  };
  return () => es.close();
}
