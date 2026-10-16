import { useEffect, useState } from 'react';
import type { RealtimeSnapshot } from '../services/realtimeService';

const DEFAULT: RealtimeSnapshot = {
  activeUsers: 0,
  requestsPerMin: 0,
  errorsLastMinute: 0,
  avgResponseTime: 0,
  events: [],
};

export function useRealtimeStream() {
  const [data, setData] = useState<RealtimeSnapshot>(DEFAULT);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(false);
    const es = new EventSource('http://localhost:3000/realtime/stream');

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data));
        setConnected(true);
      } catch { /* ignore */ }
    };

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  return { data, connected };
}
