import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MatchStage, MatchStatus } from '@/types/match';
import { usePredictionHistory } from '../hooks/usePredictionHistory';

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-Final',
  SEMI_FINAL: 'Semi-Final',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

const MATCH_STATUS_CONFIG: Record<
  MatchStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    className?: string;
  }
> = {
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' },
  LOCKED: { label: 'Locked', variant: 'outline' },
  FINISHED: { label: 'Finished', variant: 'default' },
  SCORED: {
    label: 'Scored',
    variant: 'secondary',
    className: 'bg-green-600 text-white hover:bg-green-700',
  },
};

function formatKickoff(kickoffAt: string) {
  return format(new Date(kickoffAt), 'dd MMM yyyy HH:mm');
}

function getStageLabel(stage: MatchStage) {
  return STAGE_LABELS[stage] ?? stage;
}

export default function PredictionHistoryPage() {
  const { items, page, totalPages, totalCount, pageSize, setPage, isLoading, isError } =
    usePredictionHistory();

  if (isError) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Could not load prediction history. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>My Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>My Prediction</TableHead>
                <TableHead>Actual Result</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: pageSize }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`}>
                      {Array.from({ length: 7 }).map((__, cellIndex) => (
                        <TableCell key={`skeleton-${rowIndex}-${cellIndex}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : totalCount === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        No predictions made yet.
                      </TableCell>
                    </TableRow>
                    )
                  : items.map((item) => {
                      const statusConfig = item.match ? MATCH_STATUS_CONFIG[item.match.status] : null;

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.match ? `${item.match.homeTeam} vs ${item.match.awayTeam}` : '—'}
                          </TableCell>
                          <TableCell>{item.match ? formatKickoff(item.match.kickoffAt) : '—'}</TableCell>
                          <TableCell>{item.match ? getStageLabel(item.match.stage) : '—'}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{`${item.predictedHomeScore} – ${item.predictedAwayScore}`}</span>
                              {item.predictedPenaltyWinner ? (
                                <span className="text-xs text-muted-foreground">
                                  {`(PW: ${item.predictedPenaltyWinner})`}
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.match?.result
                              ? `${item.match.result.homeScore} – ${item.match.result.awayScore}`
                              : '—'}
                          </TableCell>
                          <TableCell>{item.pointsEarned ?? '—'}</TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              {statusConfig ? (
                                <Badge variant={statusConfig.variant} className={statusConfig.className}>
                                  {statusConfig.label}
                                </Badge>
                              ) : null}
                              <Badge variant={item.locked ? 'outline' : 'secondary'}>
                                {item.locked ? 'Locked' : 'Editable'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
            </TableBody>
          </Table>

          {!isLoading && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
