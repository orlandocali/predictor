import { Loader2, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useGroupedMatches } from '@/features/matches/hooks/useGroupedMatches';
import type { MatchStage } from '@/types/match';
import MatchPredictionCard from '../components/MatchPredictionCard';

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Predictions</h1>
        <p className="text-sm text-muted-foreground">Submit your score predictions before each match locks</p>
      </div>

      <div className="flex gap-1 border-b">
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
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Failed to load matches. Please try again.</p>
        </div>
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
