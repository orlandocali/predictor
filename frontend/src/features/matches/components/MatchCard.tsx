import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock } from 'lucide-react';
import type { MatchResponse, MatchStatus } from '@/types/match';

interface MatchCardProps {
  match: MatchResponse;
}

function formatKickoff(utcString: string): string {
  const date = new Date(utcString);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'secondary' },
  LOCKED:    { label: 'Locked',    variant: 'destructive' },
  FINISHED:  { label: 'Finished',  variant: 'outline' },
  SCORED:    { label: 'Scored',    variant: 'default' },
};

export function MatchCard({ match }: MatchCardProps) {
  const { label, variant } = STATUS_CONFIG[match.status];
  const hasResult = match.result != null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        {/* Status + Group row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={variant} className="text-xs">
              {match.status === 'LOCKED' && <Lock className="h-3 w-3 mr-1" />}
              {label}
            </Badge>
            {match.group && (
              <span className="text-xs text-muted-foreground font-medium">
                Group {match.group}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatKickoff(match.kickoffAt)}
          </div>
        </div>

        {/* Teams + Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex-1 text-right">
            <span className="font-semibold text-sm sm:text-base leading-tight">
              {match.homeTeam}
            </span>
          </div>

          {/* Score or VS */}
          <div className="flex items-center gap-1 shrink-0">
            {hasResult ? (
              <>
                <span className="text-xl font-bold tabular-nums w-7 text-center">
                  {match.result!.homeScore}
                </span>
                <span className="text-muted-foreground font-bold">–</span>
                <span className="text-xl font-bold tabular-nums w-7 text-center">
                  {match.result!.awayScore}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground px-2">vs</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 text-left">
            <span className="font-semibold text-sm sm:text-base leading-tight">
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Penalty winner note */}
        {hasResult && match.result!.penaltyWinner && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Penalties: <span className="font-medium">{match.result!.penaltyWinner}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
