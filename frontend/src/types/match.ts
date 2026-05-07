export type MatchStatus = 'SCHEDULED' | 'LOCKED' | 'FINISHED' | 'SCORED';

export type MatchStage =
  | 'GROUP_STAGE'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  penaltyWinner?: string;
}

export interface MatchResponse {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string; // ISO-8601 UTC instant
  stage: MatchStage;
  group?: string; // e.g. "A", "B" — only for GROUP_STAGE
  status: MatchStatus;
  result?: MatchResult;
}

export interface MatchFilters {
  stage?: MatchStage;
  status?: MatchStatus;
  group?: string;
}

export interface GroupedStage {
  stage: MatchStage;
  matches: MatchResponse[];
}

export interface CreateMatchRequest {
  homeTeam: string;
  awayTeam: string;
  stage: MatchStage;
  groupName?: string;
  kickoffAt: string; // ISO-8601 UTC string
}

export interface UpdateMatchStatusRequest {
  status: MatchStatus;
}
