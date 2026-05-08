// src/features/admin/pages/ResultEntryPage.tsx
// Admin page for submitting or reviewing a match result.
// Route: /admin/matches/:id/result

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import ResultForm from '@/features/admin/components/ResultForm';
import { matchService } from '@/services/matchService';
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

function ScoredResult({ match, onBack }: { match: MatchResponse; onBack: () => void }) {
  const result = match.result;
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <CardTitle>Result Already Scored</CardTitle>
        </div>
        <CardDescription>
          {STAGE_LABELS[match.stage]}
          {match.group ? ` — Group ${match.group}` : ''}
          {' · '}
          {format(new Date(match.kickoffAt), 'PPP HH:mm')} UTC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-lg font-semibold">
          {match.homeTeam} <span className="text-muted-foreground font-normal">vs</span> {match.awayTeam}
        </p>

        <div className="text-center bg-muted/50 rounded-lg py-4">
          <p className="text-3xl font-bold tracking-tight">
            {result?.homeScore ?? '?'} – {result?.awayScore ?? '?'}
          </p>
          {result?.penaltyWinner && (
            <p className="text-sm text-muted-foreground mt-1">
              Penalty winner: <span className="font-medium text-foreground">{result.penaltyWinner}</span>
            </p>
          )}
          {result?.extraTimeHomeScore !== undefined && result?.extraTimeAwayScore !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              Extra time: {result.extraTimeHomeScore} – {result.extraTimeAwayScore}
            </p>
          )}
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground text-center">
          Predictions have been scored. To re-score, use the{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">POST /api/admin/scores/recalculate/{match.id}</code>{' '}
          endpoint.
        </p>

        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
      </CardContent>
    </Card>
  );
}

function NotReadyState({ match, onBack }: { match: MatchResponse; onBack: () => void }) {
  const statusCfg = STATUS_CONFIG[match.status];
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Result Entry Unavailable</CardTitle>
        </div>
        <CardDescription>
          {match.homeTeam} vs {match.awayTeam}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This match is not yet finished. Result entry is only available for matches with{' '}
          <Badge variant="default">Finished</Badge> status.
        </p>
        <p className="text-sm">
          Current status:{' '}
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </p>
        <Button variant="outline" className="w-full" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ResultEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: match, isLoading, isError, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id!),
    enabled: !!id,
  });

  const handleBack = () => navigate('/admin/matches');
  const handleSuccess = () => navigate('/admin/matches');

  // Guard: missing URL param
  if (!id) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid match URL.</AlertDescription>
        </Alert>
        <Button variant="link" onClick={handleBack}>
          Back to Matches
        </Button>
      </div>
    );
  }

  if (isLoading) return <LoadingSkeleton />;

  if (isError || !match) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <Alert variant="destructive" className="text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load match.'}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Matches
        </Button>
      </div>
    );
  }

  // Already scored — show read-only result
  if (match.status === 'SCORED') {
    return (
      <div className="max-w-2xl mx-auto">
        <ScoredResult match={match} onBack={handleBack} />
      </div>
    );
  }

  // Not yet finished — show locked state
  if (match.status !== 'FINISHED') {
    return (
      <div className="max-w-2xl mx-auto">
        <NotReadyState match={match} onBack={handleBack} />
      </div>
    );
  }

  // FINISHED — show result entry form
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Matches
      </Button>
      <ResultForm match={match} onSuccess={handleSuccess} />
    </div>
  );
}
