import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './api';
import type { MatchFilters, MatchResponse, GroupedStage } from '@/types/match';

export interface SyncResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

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
    apiGet<MatchResponse[]>(`/api/v1/matches${buildQuery(filters)}`),

  getGroupedMatches: (): Promise<GroupedStage[]> =>
    apiGet<GroupedStage[]>('/api/v1/matches/grouped'),

  getMatchById: (id: string): Promise<MatchResponse> =>
    apiGet<MatchResponse>('/api/v1/matches/' + id),

  getAdminMatches: (filters?: MatchFilters): Promise<MatchResponse[]> =>
    apiGet<MatchResponse[]>(`/api/v1/admin/matches/${buildQuery(filters)}`),

  createMatch: (data: Record<string, unknown>): Promise<MatchResponse> =>
    apiPost<Record<string, unknown>, MatchResponse>('/api/v1/admin/matches/', data),

  syncMatches: (): Promise<SyncResult> =>
    apiPost<Record<string, never>, SyncResult>('/api/v1/admin/matches/sync', {}),

  updateMatchStatus: (id: string, data: { status: MatchResponse['status'] }): Promise<MatchResponse> =>
    apiPatch<{ status: MatchResponse['status'] }, MatchResponse>(`/api/v1/admin/matches/${id}/status`, data),

  updateMatch: (id: string, data: Record<string, unknown>): Promise<MatchResponse> =>
    apiPut<Record<string, unknown>, MatchResponse>(`/api/v1/admin/matches/${id}`, data),

  deleteMatch: (id: string): Promise<void> =>
    apiDelete(`/api/v1/admin/matches/${id}`),
};
