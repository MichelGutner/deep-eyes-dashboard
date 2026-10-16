import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface HealthData {
  status: string;
  uptime: number;
  services: { elasticsearch: string; database: string };
  timestamp: string;
}

export function useHealth(options?: { enabled?: boolean }) {
  return useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: () => api.get('/health').then(r => r.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
    enabled: options?.enabled ?? true,
  });
}
