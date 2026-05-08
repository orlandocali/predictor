// src/features/results/components/ResultDisplay.tsx
// Displays official match result alongside the user's prediction and earned points.

import { CheckCircle2, XCircle, Target, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MatchStatusBadge } from '@/features/matches/components/MatchStatusBadge';
import type { MatchResponse } from '@/types/match';
import type { PredictionResponse } from '@/types/prediction';

// ---------------------------------------------------------------------------
// Points outcome config
// ---------------------------------------------------------------------------
interface PointsConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
  badgeClass: string;
}

function getPointsConfig(points: number): PointsConfig {
  if (points === 3) {
    return {
      label: '3 pts',
      description: 'Exact score',
      icon: <Target className="h-5 w-5 text-green-600" />,
      badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
  }
  if (points === 1) {
    return {
      label: '1 pt',
      description: 'Correct outcome',
      icon: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
  }
  return {
    label: '0 pts',
    description: 'Incorrect',
    icon: <XCircle className="h-5 w-5 text-destructive" />,
    badgeClass: 'bg-muted text-muted-foreground',
  };
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ResultDisplayProps {
  match: MatchResponse;
  prediction: PredictionResponse | null;
}

// ---------------------------------------------------------------------------
// Sub-component: score display row
// ---------------------------------------------------------------------------
function ScoreRow({
  label,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  dimmed,
}: {
  label: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  dimmed?: boolean;
}) {
  return (
    <div className={dimmed ? 'opacity-60' : undefined}>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="text-right text-sm font-medium truncate">{homeTeam}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums w-8 text-center">{homeScore}</span>
          <Minus className="h-4 w-4 text-muted-foreground" />
          <span className="text-2xl font-bold tabular-nums w-8 text-center">{awayScore}</span>
        </div>
        <p className="text-left text-sm font-medium truncate">{awayTeam}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ResultDisplay({ match, prediction }: ResultDisplayProps) {
  const isScored = match.status === 'SCORED';
  const hasResult = match.result != null;
  const hasPrediction = prediction != null;
  const pointsEarned = prediction?.pointsEarned;
  const pointsConfig =
    isScored && hasPrediction && pointsEarned !== undefined
      ? getPointsConfig(pointsEarned)
      : null;

  return (
    <div className="space-y-4">
      {/* Match header card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {match.homeTeam} vs {match.awayTeam}
            </CardTitle>
            <MatchStatusBadge status={match.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Official result */}
          {hasResult ? (
            <ScoreRow
              label="Official Result"
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homeScore={match.result!.homeScore}
              awayScore={match.result!.awayScore}
            />
          ) : (
            <div className="text-center text-sm text-muted-foreground py-2">
              Result not yet recorded.
            </div>
          )}

          {/* Extra time */}
          {hasResult &&
            match.result!.extraTimeHomeScore !== undefined &&
            match.result!.extraTimeAwayScore !== undefined && (
              <div className="text-center text-xs text-muted-foreground">
                After extra time:{' '}
                <span className="font-medium text-foreground">
                  {match.result!.extraTimeHomeScore} – {match.result!.extraTimeAwayScore}
                </span>
              </div>
            )}

          {/* Penalty winner */}
          {hasResult && match.result!.penaltyWinner && (
            <div className="text-center text-xs text-muted-foreground">
              Penalty shoot-out winner:{' '}
              <span className="font-medium text-foreground">{match.result!.penaltyWinner}</span>
            </div>
          )}

          {/* Divider */}
          {hasPrediction && hasResult && (
            <hr className="border-border" />
          )}

          {/* User prediction */}
          {hasPrediction ? (
            <ScoreRow
              label="Your Prediction"
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homeScore={prediction.predictedHomeScore}
              awayScore={prediction.predictedAwayScore}
              dimmed={!hasResult}
            />
          ) : (
            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              You did not submit a prediction for this match.
            </div>
          )}

          {/* Predicted penalty winner */}
          {hasPrediction && prediction.predictedPenaltyWinner && (
            <div className="text-center text-xs text-muted-foreground">
              Your penalty pick:{' '}
              <span className="font-medium text-foreground">
                {prediction.predictedPenaltyWinner}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points earned card — only when scored */}
      {pointsConfig && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {pointsConfig.icon}
                <div>
                  <p className="font-semibold">{pointsConfig.description}</p>
                  <p className="text-xs text-muted-foreground">Points earned for this match</p>
                </div>
              </div>
              <Badge className={pointsConfig.badgeClass}>
                {pointsConfig.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending scoring note */}
      {match.status === 'FINISHED' && (
        <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
          This match has finished but predictions haven't been scored yet.
          Points will appear once an admin processes the result.
        </div>
      )}
    </div>
  );
}
