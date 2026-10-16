import { useQuery } from '@tanstack/react-query';
import { fetchErrors } from '../services/errorsService';

export function useErrors(timeRange = '7d') {
  return useQuery({
    queryKey: ['errors', timeRange],
    queryFn: () => fetchErrors(timeRange),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
