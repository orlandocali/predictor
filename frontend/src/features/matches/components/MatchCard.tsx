import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, CheckCircle2, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import TeamFlag from '@/components/TeamFlag';
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

const STATUS_CONFIG: Record<
  MatchStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ReactNode;
    className?: string;
  }
> = {
  SCHEDULED: {
    label: 'Scheduled',
    variant: 'secondary',
    icon: <CircleDot className="h-3 w-3" />,
  },
  LOCKED: {
    label: 'Locked',
    variant: 'destructive',
    icon: <Lock className="h-3 w-3" />,
  },
  FINISHED: {
    label: 'Finished',
    variant: 'outline',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  SCORED: {
    label: 'Scored',
    variant: 'default',
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: 'bg-green-700 hover:bg-green-700 text-white border-transparent',
  },
};

export function MatchCard({ match }: MatchCardProps) {
  const config = STATUS_CONFIG[match.status];
  const hasResult = match.result != null;

  return (
    <Card className="overflow-hidden transition-colors hover:border-border/80 hover:bg-card/80">
      {/* Top strip: status + metadata */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 bg-muted/20">
        <div className="flex items-center gap-2">
          <Badge
            variant={config.variant}
            className={cn('gap-1 text-[11px] px-2 py-0.5 h-5', config.className)}
          >
            {config.icon}
            {config.label}
          </Badge>
          {match.group && (
            <span className="text-[11px] text-muted-foreground font-medium">
              Group {match.group}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{formatKickoff(match.kickoffAt)}</span>
        </div>
      </div>

      <CardContent className="px-4 py-4">
        {/* Teams + Score */}
        <div className="flex items-center gap-3">
          {/* Home team */}
          <div className="flex-1 min-w-0">
            <span className={cn(
              'flex items-center gap-1.5 font-semibold leading-tight text-sm sm:text-base',
              hasResult && match.result!.homeScore > match.result!.awayScore && 'text-primary'
            )}>
              <TeamFlag team={match.homeTeam} />
              <span className="truncate">{match.homeTeam}</span>
            </span>
          </div>

          {/* Score or VS separator */}
          <div className="flex items-center gap-1.5 shrink-0 rounded-md bg-muted/50 px-3 py-1">
            {hasResult ? (
              <>
                <span className="text-lg font-bold tabular-nums w-6 text-center leading-none">
                  {match.result!.homeScore}
                </span>
                <span className="text-muted-foreground text-sm font-bold">–</span>
                <span className="text-lg font-bold tabular-nums w-6 text-center leading-none">
                  {match.result!.awayScore}
                </span>
              </>
            ) : (
              <span className="text-xs font-bold text-muted-foreground tracking-widest px-1">VS</span>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 min-w-0 text-right">
            <span className={cn(
              'flex items-center justify-end gap-1.5 font-semibold leading-tight text-sm sm:text-base',
              hasResult && match.result!.awayScore > match.result!.homeScore && 'text-primary'
            )}>
              <span className="truncate">{match.awayTeam}</span>
              <TeamFlag team={match.awayTeam} />
            </span>
          </div>
        </div>

        {/* Penalty winner */}
        {hasResult && match.result!.penaltyWinner && (
          <p className="mt-2.5 text-center text-xs text-muted-foreground border-t border-border pt-2.5">
            Penalties: <span className="font-semibold text-foreground">{match.result!.penaltyWinner}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
