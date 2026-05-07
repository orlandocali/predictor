// src/features/admin/hooks/useMatchAdmin.ts
// TanStack Query mutations for admin match management.
// Exports Zod schema (used by MatchForm) and two mutation hooks.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { matchService } from '@/services/matchService';
import type { MatchResponse, MatchFilters } from '@/types/match';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const ADMIN_MATCHES_KEY = ['admin', 'matches'] as const;
export const MATCHES_KEY = ['matches'] as const;

// ---------------------------------------------------------------------------
// Zod schema — shared with MatchForm
// ---------------------------------------------------------------------------
export const createMatchSchema = z
  .object({
    homeTeam: z.string().min(1, 'Home team is required'),
    awayTeam: z.string().min(1, 'Away team is required'),
    stage: z.enum([
      'GROUP_STAGE',
      'ROUND_OF_16',
      'QUARTER_FINAL',
      'SEMI_FINAL',
      'THIRD_PLACE',
      'FINAL',
    ]),
    groupName: z
      .string()
      .length(1, 'Group must be a single letter (A–H)')
      .optional()
      .or(z.literal('')),
    kickoffAt: z
      .string()
      .min(1, 'Kickoff date/time is required')
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid date-time format'),
  })
  .refine(
    (data) => data.stage !== 'GROUP_STAGE' || (!!data.groupName && data.groupName !== ''),
    {
      message: 'Group name is required for Group Stage',
      path: ['groupName'],
    }
  );

export type CreateMatchFormValues = z.infer<typeof createMatchSchema>;

// ---------------------------------------------------------------------------
// useAdminMatches — fetch all matches via admin endpoint
// ---------------------------------------------------------------------------
export function useAdminMatches(filters?: MatchFilters) {
  return useQuery({
    queryKey: [...ADMIN_MATCHES_KEY, filters],
    queryFn: () => matchService.getAdminMatches(filters),
  });
}

// ---------------------------------------------------------------------------
// useCreateMatch — POST /api/v1/admin/matches
// No optimistic update (server assigns id + timestamps).
// On success: invalidate all match queries.
// ---------------------------------------------------------------------------
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateMatchFormValues) => {
      const { groupName, kickoffAt, ...rest } = values;
      return matchService.createMatch({
        ...rest,
        groupName: groupName || undefined,
        // Convert datetime-local string to UTC ISO-8601
        kickoffAt: new Date(kickoffAt).toISOString(),
      });
    },
    onSuccess: () => {
      // Invalidate admin list and public grouped view
      queryClient.invalidateQueries({ queryKey: ADMIN_MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateMatch — PUT /api/v1/admin/matches/{id}
// ---------------------------------------------------------------------------
export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CreateMatchFormValues }) => {
      const { groupName, kickoffAt, ...rest } = values;
      return matchService.updateMatch(id, {
        ...rest,
        groupName: groupName || undefined,
        kickoffAt: new Date(kickoffAt + ':00Z').toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// useDeleteMatch — DELETE /api/v1/admin/matches/{id}
// ---------------------------------------------------------------------------
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => matchService.deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateMatchStatus — PATCH /api/v1/admin/matches/{id}/status
// Optimistic update: immediately reflect the new status in the admin cache.
// Rolls back on error; re-syncs on settled.
// ---------------------------------------------------------------------------
export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      matchService.updateMatchStatus(id, { status: status as MatchResponse['status'] }),

    onMutate: async ({ id, status }) => {
      // Cancel any in-flight refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ADMIN_MATCHES_KEY });

      // Snapshot current cache for rollback
      const snapshot = queryClient.getQueryData<MatchResponse[]>(ADMIN_MATCHES_KEY);

      // Optimistically update the target match's status
      queryClient.setQueriesData<MatchResponse[]>(
        { queryKey: ADMIN_MATCHES_KEY },
        (old) =>
          old?.map((m) =>
            m.id === id ? { ...m, status: status as MatchResponse['status'] } : m
          )
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      // Roll back to snapshot
      if (context?.snapshot) {
        queryClient.setQueryData(ADMIN_MATCHES_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      // Always re-sync from server
      queryClient.invalidateQueries({ queryKey: ADMIN_MATCHES_KEY });
      queryClient.invalidateQueries({ queryKey: MATCHES_KEY });
    },
  });
}
