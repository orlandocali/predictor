import { z } from 'zod';

// ---------------------------------------------------------------------------
// LoginPage.tsx
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// useUserAdmin.ts
// ---------------------------------------------------------------------------
export const createUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  role: z.enum(['USER', 'ADMIN']),
});

export const updateUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  displayName: z.string().min(1, 'Display name is required'),
  role: z.enum(['USER', 'ADMIN']),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// ---------------------------------------------------------------------------
// useMatchAdmin.ts
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
// useResultSubmission.ts
// ---------------------------------------------------------------------------
const KNOCKOUT_STAGES = [
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL',
] as const;

export function isKnockoutStage(stage: string): boolean {
  return (KNOCKOUT_STAGES as readonly string[]).includes(stage);
}

export const resultSchema = z.object({
  homeScore: z.coerce
    .number({ error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative'),
  awayScore: z.coerce
    .number({ error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative'),
  penaltyWinner: z.string().optional(),
  extraTimeHomeScore: z.coerce
    .number({ error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative')
    .optional(),
  extraTimeAwayScore: z.coerce
    .number({ error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(0, 'Score cannot be negative')
    .optional(),
});

export type ResultFormValues = z.infer<typeof resultSchema>;

export function makeResultSchema(stage: string) {
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
// PredictionForm.tsx
// ---------------------------------------------------------------------------
export const basePredictionSchema = z.object({
  predictedHomeScore: z.coerce
    .number<number>()
    .int()
    .min(0, 'Score must be a non-negative whole number'),
  predictedAwayScore: z.coerce
    .number<number>()
    .int()
    .min(0, 'Score must be a non-negative whole number'),
  predictedPenaltyWinner: z.string().optional(),
});

export const knockoutPredictionSchema = basePredictionSchema.refine(
  (values) => Boolean(values.predictedPenaltyWinner),
  {
    message: 'Penalty winner is required for knockout matches.',
    path: ['predictedPenaltyWinner'],
  }
);

export type PredictionFormValues = z.infer<typeof basePredictionSchema>;
