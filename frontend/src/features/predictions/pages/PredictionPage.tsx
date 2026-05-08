import { Loader2, AlertCircle, Star } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGroupedMatches } from '@/features/matches/hooks/useGroupedMatches';
import type { MatchStage } from '@/types/match';
import MatchPredictionCard from '../components/MatchPredictionCard';
import { PageHeader } from '@/components/PageHeader';

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP_STAGE: 'Group Stage',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter Final',
  SEMI_FINAL: 'Semi Final',
  THIRD_PLACE: 'Third Place',
  FINAL: 'Final',
};

function PredictionPage() {
  const { data, isLoading, isError } = useGroupedMatches();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="My Predictions"
        description="Submit your score predictions before each match locks."
        icon={<Star className="h-5 w-5" />}
      />

      <div className="flex gap-1 border-b border-border">
        <NavLink
          to="/predictions"
          end
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`
          }
        >
          Submit Predictions
        </NavLink>
        <NavLink
          to="/predictions/history"
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`
          }
        >
          History
        </NavLink>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load predictions.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          {(data ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <p className="font-medium">No matches found</p>
              <p className="text-sm mt-1">No stages available for predictions yet.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {(data ?? []).map((group) => (
                <section key={group.stage}>
                  <h2 className="text-lg font-semibold mb-4">{STAGE_LABELS[group.stage]}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.matches.map((match) => (
                      <MatchPredictionCard key={match.id} match={match} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PredictionPage;
