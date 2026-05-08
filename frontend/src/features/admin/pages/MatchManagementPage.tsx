// src/features/admin/pages/MatchManagementPage.tsx
// Admin page for managing matches: create, edit, delete, and transition status.

import { useState } from 'react';
import { format } from 'date-fns';
import { PlusCircle, Loader2, Pencil, Trash2, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import MatchForm from '@/features/admin/components/MatchForm';
import {
  useAdminMatches,
  useUpdateMatchStatus,
  useDeleteMatch,
} from '@/features/admin/hooks/useMatchAdmin';
import type { MatchResponse, MatchStatus } from '@/types/match';

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

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' },
  LOCKED:    { label: 'Locked',    variant: 'outline' },
  FINISHED:  { label: 'Finished',  variant: 'default' },
  SCORED:    { label: 'Scored',    variant: 'destructive' },
};

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
  const [editingMatch, setEditingMatch] = useState<MatchResponse | undefined>();
  const [deletingMatch, setDeletingMatch] = useState<MatchResponse | undefined>();

  const navigate = useNavigate();
  const { data: matches, isLoading, isError } = useAdminMatches();
  const deleteMatch = useDeleteMatch();

  function openCreate() {
    setEditingMatch(undefined);
    setFormOpen(true);
  }

  function openEdit(match: MatchResponse) {
    setEditingMatch(match);
    setFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open);
    if (!open) setEditingMatch(undefined);
  }

  function confirmDelete() {
    if (!deletingMatch) return;
    deleteMatch.mutate(deletingMatch.id, {
      onSettled: () => setDeletingMatch(undefined),
    });
  }

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
        <Button onClick={openCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Match
        </Button>
      </div>

      {/* Create / Edit dialog */}
      <MatchForm open={formOpen} onOpenChange={handleFormClose} match={editingMatch} />

      {/* Delete confirmation dialog */}
      <Dialog open={deletingMatch != null} onOpenChange={(open) => { if (!open) setDeletingMatch(undefined); }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete match?</DialogTitle>
            <DialogDescription>
              {deletingMatch && (
                <>
                  <span className="font-medium">{deletingMatch.homeTeam}</span>
                  {' vs '}
                  <span className="font-medium">{deletingMatch.awayTeam}</span>
                  {' will be permanently deleted. This cannot be undone.'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMatch(undefined)} disabled={deleteMatch.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMatch.isPending}
            >
              {deleteMatch.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <Button variant="outline" className="mt-4" onClick={openCreate}>
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
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <StatusTransitionButton match={match} />
                        {match.status === 'FINISHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/matches/${match.id}/result`)}
                            title="Enter result"
                            className="text-primary"
                          >
                            <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                            Enter Result
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(match)}
                          title="Edit match"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingMatch(match)}
                          title="Delete match"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
