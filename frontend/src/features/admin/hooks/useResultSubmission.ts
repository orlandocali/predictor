// src/features/admin/hooks/useResultSubmission.ts
// Zod schema factory + TanStack Query mutation for submitting match results.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchService } from '@/services/matchService';
import type { MatchResponse, MatchStage } from '@/types/match';
import {
  isKnockoutStage,
  makeResultSchema,
  type ResultFormValues,
} from '@/features/shared/utils/validationSchemas';
import { ADMIN_MATCHES_KEY, MATCHES_KEY } from './useMatchAdmin';

export { isKnockoutStage, makeResultSchema, type ResultFormValues };

// ---------------------------------------------------------------------------
// useSubmitResult — routes to the correct endpoint by stage:
//   Group stage  → POST /api/v1/admin/matches/{matchId}/result
//   Knockout     → POST /api/v1/admin/matches/{matchId}/knockout-result
//                  (includes computed qualifyingTeam)
// On success: invalidate admin match list + single match cache
// ---------------------------------------------------------------------------
export function useSubmitResult(match: MatchResponse) {
  const queryClient = useQueryClient();
  const isKnockout = isKnockoutStage(match.stage);

  return useMutation({
    mutationFn: (values: ResultFormValues) => {
      if (isKnockout) {
        // Derive qualifyingTeam from scores + penalty winner — no extra UI field needed
        let qualifyingTeam: string;
        if (values.homeScore > values.awayScore) {
          qualifyingTeam = match.homeTeam;
        } else if (values.awayScore > values.homeScore) {
          qualifyingTeam = match.awayTeam;
        } else {
          // Drawn — penalty winner is the qualifier (schema enforces it is set)
          qualifyingTeam = values.penaltyWinner!;
        }

        return matchService.submitKnockoutResult(match.id, {
          homeScore: values.homeScore,
          awayScore: values.awayScore,
          qualifyingTeam,
          ...(values.penaltyWinner ? { penaltyWinner: values.penaltyWinner } : {}),
          ...(values.extraTimeHomeScore !== undefined ? { extraTimeHomeScore: values.extraTimeHomeScore } : {}),
          ...(values.extraTimeAwayScore !== undefined ? { extraTimeAwayScore: values.extraTimeAwayScore } : {}),
        });
      }

      return matchService.submitResult(match.id, {
        homeScore: values.homeScore,
        awayScore: values.awayScore,
        ...(values.penaltyWinner ? { penaltyWinner: values.penaltyWinner } : {}),
        ...(values.extraTimeHomeScore !== undefined ? { extraTimeHomeScore: values.extraTimeHomeScore } : {}),
        ...(values.extraTimeAwayScore !== undefined ? { extraTimeAwayScore: values.extraTimeAwayScore } : {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: ['match', match.id] });
    },
  });
}
