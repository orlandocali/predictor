// src/features/admin/components/ResultForm.tsx
// Admin form for entering match results.
// Renders inside a Card on ResultEntryPage — no dialog chrome.

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Trophy } from 'lucide-react';
import {
  makeResultSchema,
  useSubmitResult,
  isKnockoutStage,
  type ResultFormValues,
} from '@/features/admin/hooks/useResultSubmission';
import type { MatchResponse } from '@/types/match';
import { format } from 'date-fns';

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------
const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE:   'Group Stage',
  ROUND_OF_16:   'Round of 16',
  QUARTER_FINAL: 'Quarter-Final',
  SEMI_FINAL:    'Semi-Final',
  THIRD_PLACE:   'Third Place',
  FINAL:         'Final',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ResultFormProps {
  match: MatchResponse;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ResultForm({ match, onSuccess }: ResultFormProps) {
  const isKnockout = isKnockoutStage(match.stage);
  const mutation = useSubmitResult(match);

  const form = useForm<ResultFormValues>({
    // zodResolver with z.coerce.number() produces unknown input types that don't
    // satisfy RHF's strict Resolver generic. Cast is safe: runtime behavior is correct.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(makeResultSchema(match.stage)) as any,
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
      penaltyWinner: undefined,
      extraTimeHomeScore: undefined,
      extraTimeAwayScore: undefined,
    },
  });

  const [watchedHome, watchedAway] = useWatch({
    control: form.control,
    name: ['homeScore', 'awayScore'],
  });

  const homeNum = Number(watchedHome);
  const awayNum = Number(watchedAway);
  const isValid = !isNaN(homeNum) && !isNaN(awayNum) && homeNum >= 0 && awayNum >= 0;
  const isTie = isValid && homeNum === awayNum;
  const showPenaltyWinner = isKnockout && isTie;

  async function onSubmit(values: ResultFormValues) {
    try {
      await mutation.mutateAsync(values);
      onSuccess?.();
    } catch {
      // Error surfaced via mutation.isError below
    }
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Enter Match Result</CardTitle>
        </div>
        <CardDescription>
          {STAGE_LABELS[match.stage]}
          {match.group ? ` — Group ${match.group}` : ''}
          {' · '}
          {format(new Date(match.kickoffAt), 'PPP HH:mm')} UTC
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Match header */}
            <div className="text-center">
              <p className="text-lg font-semibold">
                {match.homeTeam} <span className="text-muted-foreground font-normal">vs</span> {match.awayTeam}
              </p>
            </div>

            <hr className="border-border" />

            {/* Score row */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
              <FormField
                control={form.control}
                name="homeScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{match.homeTeam}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <span className="pb-2 text-xl font-bold text-muted-foreground">–</span>

              <FormField
                control={form.control}
                name="awayScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{match.awayTeam}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        disabled={mutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Live score preview */}
            {isValid && (
              <p className="text-sm text-center text-muted-foreground bg-muted/50 rounded-md py-2 px-4">
                Official score:{' '}
                <span className="font-semibold text-foreground">
                  {homeNum} – {awayNum}
                </span>
              </p>
            )}

            {/* Extra time fields — only for knockout matches */}
            {isKnockout && (
              <>
                <hr className="border-border" />
                <p className="text-sm font-medium text-muted-foreground">
                  Extra Time (optional)
                </p>
                <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                  <FormField
                    control={form.control}
                    name="extraTimeHomeScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          {match.homeTeam} (ET)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            placeholder="–"
                            disabled={mutation.isPending}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? undefined : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <span className="pb-2 text-xl font-bold text-muted-foreground">–</span>

                  <FormField
                    control={form.control}
                    name="extraTimeAwayScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          {match.awayTeam} (ET)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            placeholder="–"
                            disabled={mutation.isPending}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? undefined : e.target.value
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Penalty winner — only shown for knockout ties */}
            {showPenaltyWinner && (
              <>
                <hr className="border-border" />
                <FormField
                  control={form.control}
                  name="penaltyWinner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Penalty Shoot-out Winner</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                        disabled={mutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select winner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={match.homeTeam}>{match.homeTeam}</SelectItem>
                          <SelectItem value={match.awayTeam}>{match.awayTeam}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Server-side error */}
            {mutation.isError && (
              <p className="text-sm font-medium text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Failed to submit result. Please try again.'}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Result
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
