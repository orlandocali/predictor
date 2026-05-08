import {
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Star,
  AlertCircle,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { useMyRanking } from '@/features/rankings/hooks/useMyRanking';
import { useAuth } from '@/features/auth/useAuth';

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Position hero skeleton */}
      <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <Skeleton className="h-20 w-24 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score breakdown skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accuracy skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <Trophy className="h-8 w-8 text-amber-400" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              No ranking data yet
            </p>
            <p className="text-sm text-muted-foreground">
              Make predictions to appear on the leaderboard.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ errorMessage }: { errorMessage: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}

// ─── Stat row ─────────────────────────────────────────────────────────────────

function StatRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <Badge
        variant={highlight ? 'default' : 'secondary'}
        className={`tabular-nums font-bold ${
          highlight
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300'
            : ''
        }`}
      >
        {value.toLocaleString()}
      </Badge>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyRankingPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useMyRanking();

  const accuracy =
    data && data.totalPredictions > 0
      ? (((data.exactScores + data.correctOutcomes) / data.totalPredictions) * 100).toFixed(1)
      : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
          <TrendingUp className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            My Ranking
          </h1>
          {user?.username && (
            <p className="text-sm text-muted-foreground">
              Viewing stats for{' '}
              <span className="font-medium text-foreground">{user.username}</span>
            </p>
          )}
        </div>
      </div>

      {isLoading && <LoadingSkeleton />}
      {isError && <ErrorState errorMessage="Could not load ranking. Please try again." />}

      {!isLoading && !isError && !data && <EmptyState />}

      {!isLoading && !isError && data && (
        <div className="space-y-4">
          {/* Position hero card */}
          <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <Trophy className="h-4 w-4" aria-hidden="true" />
                Global Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {/* Rank number */}
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tabular-nums leading-none text-amber-600 dark:text-amber-400">
                    #{data.rank}
                  </span>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Player</span>
                  <span className="font-semibold text-foreground">{data.username}</span>
                </div>

                {/* Total points */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Total Points</span>
                  <span className="text-2xl font-black tabular-nums text-foreground">
                    {data.totalPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score breakdown card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <StatRow
                  icon={<Star className="h-4 w-4 text-amber-500" aria-hidden="true" />}
                  label="Exact Scores (3 pts each)"
                  value={data.exactScores}
                  highlight
                />
                <StatRow
                  icon={<CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />}
                  label="Correct Outcomes (1 pt each)"
                  value={data.correctOutcomes}
                />
                <StatRow
                  icon={<XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />}
                  label="Incorrect Predictions"
                  value={data.incorrectPredictions}
                />
                <StatRow
                  icon={<Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                  label="Total Predictions"
                  value={data.totalPredictions}
                />
              </div>
            </CardContent>
          </Card>

          {/* Accuracy card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accuracy !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tabular-nums text-foreground">
                    {accuracy}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of predictions scored points
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No predictions scored yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Last updated */}
          {data.updatedAt && (
            <p className="text-center text-xs text-muted-foreground">
              Last updated:{' '}
              {new Date(data.updatedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
