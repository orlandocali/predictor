import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { MatchResponse, MatchStatus } from '@/types/match';
import type { CreatePredictionRequest } from '@/types/prediction';
import { usePredictionByMatch } from '../hooks/usePredictions';
import { usePredictionSubmit } from '../hooks/usePredictionSubmit';
import PredictionForm from './PredictionForm';

interface MatchPredictionCardProps {
  match: MatchResponse;
}

function isMatchLocked(match: MatchResponse): boolean {
  const nonEditableStatuses: MatchStatus[] = ['LOCKED', 'FINISHED', 'SCORED'];
  if (nonEditableStatuses.includes(match.status)) {
    return true;
  }

  return Date.now() >= new Date(match.kickoffAt).getTime() - 12 * 60 * 60 * 1000;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Failed to submit prediction. Please try again.';
}

function MatchPredictionCard({ match }: MatchPredictionCardProps) {
  const predictionQuery = usePredictionByMatch(match.id);
  const mutation = usePredictionSubmit();
  const locked = isMatchLocked(match);

  // Treat fetch errors (including 404/no prediction yet) as "no existing prediction".
  const existingPrediction = predictionQuery.isSuccess
    ? predictionQuery.data
    : undefined;

  const handleSubmit = (data: Omit<CreatePredictionRequest, 'matchId'>) => {
    mutation.mutate({ ...data, matchId: match.id });
  };

  const rawErrorMessage = mutation.isError ? getErrorMessage(mutation.error) : '';
  const isLockedError = rawErrorMessage.toLowerCase().includes('locked');

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-tight">
            {match.homeTeam} vs {match.awayTeam}
          </CardTitle>
          <Badge variant="outline" className="text-xs whitespace-nowrap">
            {match.stage}
          </Badge>
        </div>
        <CardDescription>
          Kickoff: {new Date(match.kickoffAt).toLocaleString()} (UTC)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <PredictionForm
          match={match}
          existingPrediction={existingPrediction}
          isLocked={locked}
          isPending={mutation.isPending}
          onSubmit={handleSubmit}
        />

        {mutation.isError && (
          <p className="text-sm text-destructive" role="alert">
            {isLockedError
              ? 'Predictions are locked for this match.'
              : rawErrorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default MatchPredictionCard;
