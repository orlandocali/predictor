import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { matchService } from '@/services/matchService';
import { predictionService } from '@/services/predictionService';
import type { GroupedStage, MatchResponse } from '@/types/match';
import type { PredictionResponse } from '@/types/prediction';

export interface EnrichedPrediction extends PredictionResponse {
  match?: MatchResponse;
}

const PAGE_SIZE = 10;

export const predictionHistoryQueryKey = () => ['predictions', 'me'] as const;
export const predictionHistoryMatchesQueryKey = () => ['matches', 'grouped'] as const;

export function usePredictionHistory() {
  const [page, setPage] = useState(1);

  const predictionsQuery = useQuery({
    queryKey: predictionHistoryQueryKey(),
    queryFn: () => predictionService.getUserPredictions(),
    staleTime: 60_000,
  });

  const matchesQuery = useQuery({
    queryKey: predictionHistoryMatchesQueryKey(),
    queryFn: () => matchService.getGroupedMatches(),
    staleTime: 60_000,
  });

  const enriched = useMemo<EnrichedPrediction[]>(() => {
    const predictions = predictionsQuery.data ?? [];
    const grouped = (matchesQuery.data ?? []) as GroupedStage[];
    const matchMap = new Map<string, MatchResponse>();

    grouped.forEach((stage) => {
      stage.matches.forEach((match) => {
        matchMap.set(match.id, match);
      });
    });

    return predictions.map((prediction) => ({
      ...prediction,
      match: matchMap.get(prediction.matchId),
    }));
  }, [predictionsQuery.data, matchesQuery.data]);

  const totalCount = enriched.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const items = enriched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    items,
    page,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    setPage,
    isLoading: predictionsQuery.isLoading || matchesQuery.isLoading,
    isError: predictionsQuery.isError || matchesQuery.isError,
  };
}
