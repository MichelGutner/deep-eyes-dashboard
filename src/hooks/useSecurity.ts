import { useQuery } from '@tanstack/react-query';
import { fetchSecurity } from '../services/securityService';

export function useSecurity(timeRange = '24h') {
  return useQuery({
    queryKey: ['security', timeRange],
    queryFn: () => fetchSecurity(timeRange),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}
