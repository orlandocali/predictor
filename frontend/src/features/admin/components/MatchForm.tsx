// src/features/admin/components/MatchForm.tsx
// Dialog form for creating or editing a match.
// Pass `match` to open in edit mode; omit it for create mode.

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';
import {
  createMatchSchema,
  type CreateMatchFormValues,
  useCreateMatch,
  useUpdateMatch,
} from '@/features/admin/hooks/useMatchAdmin';
import type { MatchResponse } from '@/types/match';

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

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Converts a UTC ISO instant to the value expected by datetime-local input (UTC shown as-is).
function toDateTimeLocalUTC(utcIso: string): string {
  return utcIso.slice(0, 16); // "2026-06-15T14:00"
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match?: MatchResponse; // present = edit mode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MatchForm({ open, onOpenChange, match }: MatchFormProps) {
  const isEdit = match != null;
  const createMatch = useCreateMatch();
  const updateMatch = useUpdateMatch();
  const mutation = isEdit ? updateMatch : createMatch;

  const form = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      homeTeam:  '',
      awayTeam:  '',
      stage:     'GROUP_STAGE',
      groupName: '',
      kickoffAt: '',
    },
  });

  const stage = useWatch({ control: form.control, name: 'stage' });
  const isGroupStage = stage === 'GROUP_STAGE';

  // Populate form when opening in edit mode or reset when closing
  useEffect(() => {
    if (open && isEdit) {
      form.reset({
        homeTeam:  match.homeTeam,
        awayTeam:  match.awayTeam,
        stage:     match.stage,
        groupName: match.group ?? '',
        kickoffAt: toDateTimeLocalUTC(match.kickoffAt),
      });
    } else if (!open) {
      form.reset({ homeTeam: '', awayTeam: '', stage: 'GROUP_STAGE', groupName: '', kickoffAt: '' });
      createMatch.reset();
      updateMatch.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: CreateMatchFormValues) {
    try {
      if (isEdit) {
        await updateMatch.mutateAsync({ id: match.id, values });
      } else {
        await createMatch.mutateAsync(values);
      }
      onOpenChange(false);
    } catch {
      // Error surfaced via mutation.error below
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Match' : 'Create New Match'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Home Team */}
            <FormField
              control={form.control}
              name="homeTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Team</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Brazil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Away Team */}
            <FormField
              control={form.control}
              name="awayTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Away Team</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Argentina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stage */}
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STAGE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Group Name — only for GROUP_STAGE */}
            {isGroupStage && (
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GROUPS.map((g) => (
                          <SelectItem key={g} value={g}>
                            Group {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Kickoff Date/Time */}
            <FormField
              control={form.control}
              name="kickoffAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kickoff Date & Time (UTC)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Enter time in UTC. It will be stored as-is.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Server-side error */}
            {mutation.isError && (
              <p className="text-sm font-medium text-destructive">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : `Failed to ${isEdit ? 'update' : 'create'} match. Please try again.`}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? 'Save Changes' : 'Create Match'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
