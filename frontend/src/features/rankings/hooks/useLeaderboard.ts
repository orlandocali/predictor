import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/useAuth';
import { apiGet } from '@/services/api';
import type { RankingPage } from '@/types/ranking';

interface LeaderboardParams {
  page: number;
  size: number;
}

export interface CurrentUserRank {
  rank: number;
  totalPoints: number;
  username: string;
}

export function useLeaderboard(params: LeaderboardParams) {
  const { page, size } = params;

  return useQuery({
    queryKey: ['rankings', 'leaderboard', page, size],
    queryFn: () => apiGet<RankingPage>(`/api/v1/rankings?page=${page}&size=${size}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCurrentUserRank() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['rankings', 'me'],
    queryFn: () => apiGet<CurrentUserRank>('/api/v1/rankings/me'),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}