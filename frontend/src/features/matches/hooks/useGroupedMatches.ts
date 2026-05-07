import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';

export const groupedMatchesQueryKey = () => ['matches', 'grouped'] as const;

export function useGroupedMatches() {
  return useQuery({
    queryKey: groupedMatchesQueryKey(),
    queryFn: () => matchService.getGroupedMatches(),
    staleTime: 60_000, // 1 minute
  });
}
