// src/features/admin/hooks/useResultSubmission.ts
// Zod schema factory + TanStack Query mutation for submitting match results.

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { matchService } from '@/services/matchService';
import type { MatchResponse, MatchStage } from '@/types/match';
import { ADMIN_MATCHES_KEY, MATCHES_KEY } from './useMatchAdmin';

// ---------------------------------------------------------------------------
// Knockout stages that may require penalty winner
// ---------------------------------------------------------------------------
const KNOCKOUT_STAGES: MatchStage[] = [
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL',
];

export function isKnockoutStage(stage: MatchStage): boolean {
  return KNOCKOUT_STAGES.includes(stage);
}

// ---------------------------------------------------------------------------
// Base Zod schema (exported for typing)
// ---------------------------------------------------------------------------
export const resultSchema = z.object({
  homeScore: z.coerce
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative'),
  awayScore: z.coerce
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative'),
  penaltyWinner: z.string().optional(),
  extraTimeHomeScore: z.coerce
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative')
    .optional(),
  extraTimeAwayScore: z.coerce
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative')
    .optional(),
});

export type ResultFormValues = z.infer<typeof resultSchema>;

// ---------------------------------------------------------------------------
// Schema factory — bakes in stage-dependent validation
// ---------------------------------------------------------------------------
export function makeResultSchema(stage: MatchStage) {
  return resultSchema.superRefine((data, ctx) => {
    const isKnockout = isKnockoutStage(stage);

    // Knockout tie requires penalty winner
    if (isKnockout && data.homeScore === data.awayScore) {
      if (!data.penaltyWinner || data.penaltyWinner.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Penalty winner is required when scores are level in a knockout match',
          path: ['penaltyWinner'],
        });
      }
    }

    // Extra-time scores must be provided in pairs
    const hasETHome = data.extraTimeHomeScore !== undefined && data.extraTimeHomeScore !== null;
    const hasETAway = data.extraTimeAwayScore !== undefined && data.extraTimeAwayScore !== null;
    if (hasETHome && !hasETAway) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Away extra time score is required when home extra time score is set',
        path: ['extraTimeAwayScore'],
      });
    }
    if (hasETAway && !hasETHome) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Home extra time score is required when away extra time score is set',
        path: ['extraTimeHomeScore'],
      });
    }
  });
}

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
