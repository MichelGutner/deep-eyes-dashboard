import { useQuery } from '@tanstack/react-query';
import { fetchPerformance } from '../services/performanceService';

export function usePerformance(timeRange = '1h', options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['performance', timeRange],
    queryFn: () => fetchPerformance(timeRange),
    staleTime: 30_000,
    refetchInterval: 30_000,
    enabled: options?.enabled ?? true,
  });
}
