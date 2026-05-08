import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Lock, Loader2 } from 'lucide-react';
import type { MatchResponse } from '@/types/match';
import type {
  PredictionResponse,
  CreatePredictionRequest,
} from '@/types/prediction';

interface PredictionFormProps {
  match: MatchResponse;
  existingPrediction?: PredictionResponse;
  isLocked: boolean;
  isPending: boolean;
  onSubmit: (data: CreatePredictionRequest) => void;
}

interface PredictionFormValues {
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedPenaltyWinner?: string;
}

const EMPTY_VALUES: PredictionFormValues = {
  predictedHomeScore: 0,
  predictedAwayScore: 0,
  predictedPenaltyWinner: '',
};

export default function PredictionForm({
  match,
  existingPrediction,
  isLocked,
  isPending,
  onSubmit,
}: PredictionFormProps) {
  const isKnockout = match.stage !== 'GROUP_STAGE';
  const isDisabled = isLocked || isPending;

  const schema = useMemo(
    () =>
      z
        .object({
          predictedHomeScore: z.coerce.number().int().min(0),
          predictedAwayScore: z.coerce.number().int().min(0),
          predictedPenaltyWinner: z.string().optional(),
        })
        .refine(
          (values) => !isKnockout || Boolean(values.predictedPenaltyWinner),
          {
            message: 'Penalty winner is required for knockout matches.',
            path: ['predictedPenaltyWinner'],
          }
        ),
    [isKnockout]
  );

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: existingPrediction
      ? {
          predictedHomeScore: existingPrediction.predictedHomeScore,
          predictedAwayScore: existingPrediction.predictedAwayScore,
          predictedPenaltyWinner: existingPrediction.predictedPenaltyWinner ?? '',
        }
      : EMPTY_VALUES,
  });

  useEffect(() => {
    if (existingPrediction) {
      form.reset({
        predictedHomeScore: existingPrediction.predictedHomeScore,
        predictedAwayScore: existingPrediction.predictedAwayScore,
        predictedPenaltyWinner: existingPrediction.predictedPenaltyWinner ?? '',
      });
      return;
    }

    form.reset(EMPTY_VALUES);
  }, [existingPrediction, form]);

  function handleSubmit(values: PredictionFormValues) {
    onSubmit({
      matchId: match.id,
      predictedHomeScore: values.predictedHomeScore,
      predictedAwayScore: values.predictedAwayScore,
      predictedPenaltyWinner:
        isKnockout && values.predictedPenaltyWinner
          ? values.predictedPenaltyWinner
          : undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {isLocked && (
          <Badge variant="secondary" className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </Badge>
        )}

        <div className="flex items-center gap-3">
          <span className="min-w-[90px] text-right text-sm font-medium">{match.homeTeam}</span>

          <FormField
            control={form.control}
            name="predictedHomeScore"
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className="text-center"
                    disabled={isDisabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <span className="text-lg font-semibold">-</span>

          <FormField
            control={form.control}
            name="predictedAwayScore"
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className="text-center"
                    disabled={isDisabled}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <span className="min-w-[90px] text-sm font-medium">{match.awayTeam}</span>
        </div>

        {isKnockout && (
          <FormField
            control={form.control}
            name="predictedPenaltyWinner"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Penalty Winner</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={isDisabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select penalty winner" />
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
        )}

        <Button type="submit" disabled={isDisabled}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            'Save Prediction'
          )}
        </Button>
      </form>
    </Form>
  );
}
