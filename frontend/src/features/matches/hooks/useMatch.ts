import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';

export const matchDetailQueryKey = (id: string) =>
  ['matches', 'detail', id] as const;

export function useMatch(id: string) {
  return useQuery({
    queryKey: matchDetailQueryKey(id),
    queryFn: () => matchService.getMatchById(id),
    staleTime: 60_000,
  });
}
