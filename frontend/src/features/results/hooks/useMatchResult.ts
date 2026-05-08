// src/features/results/hooks/useMatchResult.ts
// Combined hook for result visualization: fetches match + user prediction in parallel.

import { useQuery } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import { predictionService } from '@/services/predictionService';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const matchResultQueryKey = (matchId: string) =>
  ['results', 'match', matchId] as const;

export const resultPredictionQueryKey = (matchId: string) =>
  ['results', 'prediction', matchId] as const;

// ---------------------------------------------------------------------------
// useMatchResult — fetch match details
// ---------------------------------------------------------------------------
export function useMatchResult(matchId: string) {
  return useQuery({
    queryKey: matchResultQueryKey(matchId),
    queryFn: () => matchService.getMatchById(matchId),
    enabled: !!matchId,
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// useResultPrediction — fetch the current user's prediction for this match.
// retry: false because 404 = no prediction yet, which is a valid state.
// ---------------------------------------------------------------------------
export function useResultPrediction(matchId: string) {
  return useQuery({
    queryKey: resultPredictionQueryKey(matchId),
    queryFn: () => predictionService.getPredictionByMatch(matchId),
    enabled: !!matchId,
    retry: false,
    staleTime: 60_000,
  });
}
