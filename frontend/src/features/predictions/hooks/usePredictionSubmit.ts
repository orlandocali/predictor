import { useMutation, useQueryClient } from '@tanstack/react-query';
import { predictionService } from '@/services/predictionService';
import { predictionsQueryKey, predictionByMatchQueryKey } from './usePredictions';
import type { PredictionResponse, CreatePredictionRequest } from '@/types/prediction';

export function usePredictionSubmit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePredictionRequest) =>
      predictionService.submitPrediction(data),

    onMutate: async (newData) => {
      await queryClient.cancelQueries({
        queryKey: predictionByMatchQueryKey(newData.matchId),
      });

      const previous = queryClient.getQueryData<PredictionResponse>(
        predictionByMatchQueryKey(newData.matchId),
      );

      queryClient.setQueryData<Partial<PredictionResponse>>(
        predictionByMatchQueryKey(newData.matchId),
        (old) => ({
          ...old,
          matchId: newData.matchId,
          predictedHomeScore: newData.predictedHomeScore,
          predictedAwayScore: newData.predictedAwayScore,
          predictedPenaltyWinner: newData.predictedPenaltyWinner,
          locked: false,
        }),
      );

      return { previous, matchId: newData.matchId };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          predictionByMatchQueryKey(context.matchId),
          context.previous,
        );
      }
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: predictionsQueryKey() });
      queryClient.invalidateQueries({
        queryKey: predictionByMatchQueryKey(variables.matchId),
      });
    },
  });
}
