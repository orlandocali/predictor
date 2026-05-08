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
  extraTimeHomeScore?: number;
  extraTimeAwayScore?: number;
  qualifyingTeam?: string;
  wentToExtraTime?: boolean;
  wentToPenalties?: boolean;
}

export interface MatchResponse {
  id: string;
  fifaMatchId?: string;
  homeTeam: string;
  awayTeam: string;
  stage: MatchStage;
  group?: string;
  kickoffAt: string; // ISO-8601 UTC instant
  status: MatchStatus;
  venue?: string;
  result?: MatchResult;
  createdAt?: string;
  updatedAt?: string;
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
