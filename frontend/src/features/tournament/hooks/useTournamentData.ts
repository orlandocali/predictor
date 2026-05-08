// src/features/tournament/hooks/useTournamentData.ts
// Derives tournament-view data (group standings, knockout stages) from the grouped
// matches endpoint. A single network call is shared with the existing grouped query.

import { useMemo } from 'react';
import { useGroupedMatches } from '@/features/matches/hooks/useGroupedMatches';
import type { MatchResponse, MatchStage } from '@/types/match';

// ─── Stage metadata ──────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP_STAGE:   'Group Stage',
  ROUND_OF_16:   'Round of 16',
  QUARTER_FINAL: 'Quarter-Finals',
  SEMI_FINAL:    'Semi-Finals',
  THIRD_PLACE:   'Third Place',
  FINAL:         'Final',
};

export const KNOCKOUT_STAGES: MatchStage[] = [
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL',
];

// ─── Public types ─────────────────────────────────────────────────────────────

export interface GroupStandingsData {
  /** Single letter or identifier, e.g. "A", "B" */
  group: string;
  matches: MatchResponse[];
}

export interface KnockoutStageData {
  stage: MatchStage;
  matches: MatchResponse[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTournamentData() {
  const { data: groupedStages, isLoading, isError, refetch } = useGroupedMatches();

  // Group-stage matches sub-grouped by their `group` letter (A, B, …)
  const groupStandings = useMemo<GroupStandingsData[]>(() => {
    if (!groupedStages) return [];
    const stageData = groupedStages.find((s) => s.stage === 'GROUP_STAGE');
    if (!stageData) return [];

    const map = new Map<string, MatchResponse[]>();
    for (const match of stageData.matches) {
      if (!match.group) continue; // skip matches with no group assigned
      const key = match.group;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(match);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, matches]) => ({ group, matches }));
  }, [groupedStages]);

  // Knockout matches organised by stage (only stages that have ≥1 match)
  const knockoutStages = useMemo<KnockoutStageData[]>(() => {
    if (!groupedStages) return [];
    return KNOCKOUT_STAGES.map((stage) => ({
      stage,
      matches: groupedStages.find((s) => s.stage === stage)?.matches ?? [],
    })).filter((s) => s.matches.length > 0);
  }, [groupedStages]);

  const hasGroupMatches    = groupStandings.length > 0;
  const hasKnockoutMatches = knockoutStages.length > 0;

  return {
    groupStandings,
    knockoutStages,
    hasGroupMatches,
    hasKnockoutMatches,
    isLoading,
    isError,
    refetch,
  };
}
