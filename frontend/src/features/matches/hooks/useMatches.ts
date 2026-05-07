import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import type { MatchFilters } from '@/types/match';

export const matchesQueryKey = (filters?: MatchFilters) =>
  ['matches', 'list', filters ?? {}] as const;

export function useMatches(filters?: MatchFilters) {
  return useQuery({
    queryKey: matchesQueryKey(filters),
    queryFn: () => matchService.getMatches(filters),
    staleTime: 60_000, // 1 minute
  });
}
