// src/features/results/pages/MatchResultPage.tsx
// User-facing page: official result + user prediction comparison + points earned.
// Route: /results/:id

import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatchResult, useResultPrediction } from '@/features/results/hooks/useMatchResult';
import ResultDisplay from '@/features/results/components/ResultDisplay';

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function ResultSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MatchResultPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Guard: missing URL param
  if (!id) {
    return (
      <div className="p-8 text-center space-y-2">
        <p className="text-destructive font-medium">Invalid result URL.</p>
        <Button variant="link" onClick={() => navigate('/matches')}>
          Back to Matches
        </Button>
      </div>
    );
  }

  const {
    data: match,
    isLoading: matchLoading,
    isError: matchError,
    error: matchErrorData,
  } = useMatchResult(id);

  const {
    data: prediction,
    isLoading: predictionLoading,
    isError: predictionError,
  } = useResultPrediction(id);

  const isLoading = matchLoading || predictionLoading;

  if (isLoading) return <ResultSkeleton />;

  if (matchError || !match) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/matches">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Matches
          </Link>
        </Button>
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            {matchErrorData instanceof Error
              ? matchErrorData.message
              : 'Failed to load match result. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // Match not yet finished or scored — not a result page state
  if (match.status === 'SCHEDULED' || match.status === 'LOCKED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/matches/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Match
          </Link>
        </Button>
        <div className="rounded-md border p-6 text-center space-y-2">
          <p className="font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
          <p className="text-sm text-muted-foreground">
            This match hasn't finished yet. Results will appear here once it's complete.
          </p>
          <Button variant="outline" size="sm" asChild className="mt-2">
            <Link to={`/matches/${id}`}>View Match Details</Link>
          </Button>
        </div>
      </div>
    );
  }

  // prediction 404 = no prediction submitted (predictionError is fine here)
  const resolvedPrediction = predictionError ? null : (prediction ?? null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link
          to="/matches"
          onClick={(e) => {
            if (window.history.length > 1) {
              e.preventDefault();
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Link>
      </Button>

      <ResultDisplay match={match} prediction={resolvedPrediction} />
    </div>
  );
}
