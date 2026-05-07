// src/features/admin/components/MatchForm.tsx
// Dialog form for creating a new match.
// Opens from MatchManagementPage via controlled open/onOpenChange props.

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
} from '@/features/admin/hooks/useMatchAdmin';

// ---------------------------------------------------------------------------
// Label maps
// ---------------------------------------------------------------------------
const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-Final',
  SEMI_FINAL: 'Semi-Final',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MatchForm({ open, onOpenChange }: MatchFormProps) {
  const createMatch = useCreateMatch();

  const form = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      homeTeam: '',
      awayTeam: '',
      stage: 'GROUP_STAGE',
      groupName: '',
      kickoffAt: '',
    },
  });

  const stage = useWatch({ control: form.control, name: 'stage' });
  const isGroupStage = stage === 'GROUP_STAGE';

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      createMatch.reset();
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: CreateMatchFormValues) {
    try {
      await createMatch.mutateAsync(values);
      onOpenChange(false);
    } catch {
      // Error is surfaced via createMatch.error below
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
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
                  <FormLabel>Kickoff Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Enter your local time — it will be stored as UTC automatically.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Server-side error */}
            {createMatch.isError && (
              <p className="text-sm font-medium text-destructive">
                {createMatch.error instanceof Error
                  ? createMatch.error.message
                  : 'Failed to create match. Please try again.'}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMatch.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMatch.isPending}>
                {createMatch.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Match
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
