import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { apiGet } from '@/services/api';
import type { RankingEntry } from '@/types/ranking';

export type MyRankingData = RankingEntry;

export const myRankingQueryKey = () => ['rankings', 'me'] as const;

export function useMyRanking() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: myRankingQueryKey(),
    queryFn: () => apiGet<MyRankingData>('/api/rankings/me'),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}
