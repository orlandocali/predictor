import { useQuery } from '@tanstack/react-query';
import { predictionService } from '@/services/predictionService';

export const predictionsQueryKey = () => ['predictions', 'list'] as const;
export const predictionByMatchQueryKey = (matchId: string) =>
  ['predictions', 'match', matchId] as const;

export function usePredictions() {
  return useQuery({
    queryKey: predictionsQueryKey(),
    queryFn: () => predictionService.getUserPredictions(),
    staleTime: 60_000,
  });
}

export function usePredictionByMatch(matchId: string) {
  return useQuery({
    queryKey: predictionByMatchQueryKey(matchId),
    queryFn: () => predictionService.getPredictionByMatch(matchId),
    enabled: !!matchId,
    retry: false,
    staleTime: 60_000,
  });
}
