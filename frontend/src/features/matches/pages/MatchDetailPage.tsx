import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, Loader2, Lock, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TeamFlag from '@/components/TeamFlag';
import type { MatchStage } from '@/types/match';
import { useMatch } from '../hooks/useMatch';
import { MatchStatusBadge } from '../components/MatchStatusBadge';

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-Finals',
  SEMI_FINAL: 'Semi-Finals',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (id == null) {
    navigate('/matches', { replace: true });
    return null;
  }

  const { data, isLoading, isError } = useMatch(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || data == null) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to="/matches"
            onClick={(event) => {
              if (window.history.length > 1) {
                event.preventDefault();
                navigate(-1);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Matches
          </Link>
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load match details. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const kickoffDate = new Date(data.kickoffAt);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link
          to="/matches"
          onClick={(event) => {
            if (window.history.length > 1) {
              event.preventDefault();
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Matches
        </Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <h1 className="text-2xl font-bold flex items-center gap-2 flex-wrap">
            <TeamFlag team={data.homeTeam} size="md" />
            <span>{data.homeTeam}</span>
            <span className="text-muted-foreground font-normal text-lg">vs</span>
            <span>{data.awayTeam}</span>
            <TeamFlag team={data.awayTeam} size="md" />
          </h1>
          <MatchStatusBadge status={data.status} />
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Kickoff
            </p>
            <p className="font-semibold">
              {kickoffDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </p>

            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Stage
            </p>
            <p className="font-semibold">{STAGE_LABELS[data.stage]}</p>

            {data.group != null && (
              <>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Group
                </p>
                <p className="font-semibold">Group {data.group}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {data.result != null && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <TeamFlag team={data.homeTeam} size="md" />
                <span className="text-4xl font-bold tabular-nums">{data.result.homeScore}</span>
              </div>
              <span className="text-2xl text-muted-foreground font-bold">-</span>
              <div className="flex flex-col items-center gap-2">
                <TeamFlag team={data.awayTeam} size="md" />
                <span className="text-4xl font-bold tabular-nums">{data.result.awayScore}</span>
              </div>
            </div>
            {data.result.penaltyWinner != null && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Penalties: <span className="font-medium">{data.result.penaltyWinner}</span>
              </p>
            )}
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/results/${data.id}`}>View My Prediction Result</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {data.status === 'LOCKED' && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Predictions are locked for this match.
          </p>
        </div>
      )}
    </div>
  );
}
