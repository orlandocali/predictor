// src/features/admin/pages/MatchManagementPage.tsx
// Admin page for managing matches: create new, view all, transition status.

import { useState } from 'react';
import { format } from 'date-fns';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MatchForm from '@/features/admin/components/MatchForm';
import {
  useAdminMatches,
  useUpdateMatchStatus,
} from '@/features/admin/hooks/useMatchAdmin';
import type { MatchResponse, MatchStatus } from '@/types/match';

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

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' },
  LOCKED:    { label: 'Locked',    variant: 'outline' },
  FINISHED:  { label: 'Finished',  variant: 'default' },
  SCORED:    { label: 'Scored',    variant: 'destructive' },
};

// Valid next state for each status
const NEXT_STATUS: Partial<Record<MatchStatus, MatchStatus>> = {
  SCHEDULED: 'LOCKED',
  LOCKED:    'FINISHED',
  FINISHED:  'SCORED',
};

const NEXT_LABEL: Partial<Record<MatchStatus, string>> = {
  SCHEDULED: 'Lock',
  LOCKED:    'Finish',
  FINISHED:  'Score',
};

// ---------------------------------------------------------------------------
// Sub-component: status transition button
// ---------------------------------------------------------------------------
function StatusTransitionButton({ match }: { match: MatchResponse }) {
  const updateStatus = useUpdateMatchStatus();
  const nextStatus = NEXT_STATUS[match.status];

  if (!nextStatus) return null;

  const isPending =
    updateStatus.isPending && updateStatus.variables?.id === match.id;

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={isPending}
      onClick={() => updateStatus.mutate({ id: match.id, status: nextStatus })}
    >
      {isPending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        NEXT_LABEL[match.status]
      )}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function MatchManagementPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: matches, isLoading, isError } = useAdminMatches();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Match Management</h1>
          <p className="text-muted-foreground mt-1">
            Create matches and manage their lifecycle status.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Match
        </Button>
      </div>

      {/* Match creation dialog */}
      <MatchForm open={formOpen} onOpenChange={setFormOpen} />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load matches. Please refresh the page.
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && matches?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
          <p className="text-muted-foreground">No matches yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setFormOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create the first match
          </Button>
        </div>
      )}

      {/* Matches table */}
      {!isLoading && !isError && matches && matches.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Home</TableHead>
                <TableHead>Away</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Kickoff (UTC)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => {
                const statusCfg = STATUS_CONFIG[match.status];
                return (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.homeTeam}</TableCell>
                    <TableCell>{match.awayTeam}</TableCell>
                    <TableCell>{STAGE_LABELS[match.stage] ?? match.stage}</TableCell>
                    <TableCell>{match.group ?? '—'}</TableCell>
                    <TableCell className="tabular-nums text-sm">
                      {format(new Date(match.kickoffAt), 'dd MMM yyyy HH:mm')} UTC
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusTransitionButton match={match} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
