import { apiGet, apiPost, apiPatch } from './api';
import type {
  MatchFilters,
  MatchResponse,
  GroupedStage,
  CreateMatchRequest,
  UpdateMatchStatusRequest,
} from '@/types/match';

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

  getAdminMatches: (filters?: MatchFilters): Promise<MatchResponse[]> =>
    apiGet<MatchResponse[]>(`/api/admin/matches${buildQuery(filters)}`),

  createMatch: (body: CreateMatchRequest): Promise<MatchResponse> =>
    apiPost<CreateMatchRequest, MatchResponse>('/api/admin/matches', body),

  updateMatchStatus: (id: string, body: UpdateMatchStatusRequest): Promise<MatchResponse> =>
    apiPatch<UpdateMatchStatusRequest, MatchResponse>(`/api/admin/matches/${id}/status`, body),
};
