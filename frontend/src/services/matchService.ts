import { apiGet } from './api';
import type { MatchFilters, MatchResponse, GroupedStage } from '@/types/match';

function buildQuery(filters?: MatchFilters): string {
  const params = new URLSearchParams();
  if (filters?.stage) params.set('stage', filters.stage);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.group) params.set('group', filters.group);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const matchService = {
  getMatches: (filters?: MatchFilters): Promise<MatchResponse[]> =>
    apiGet<MatchResponse[]>(`/api/matches${buildQuery(filters)}`),

  getGroupedMatches: (): Promise<GroupedStage[]> =>
    apiGet<GroupedStage[]>('/api/matches/grouped'),
};
