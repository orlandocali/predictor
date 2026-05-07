import { Calendar } from 'lucide-react';
import { MatchCard } from './MatchCard';
import type { MatchStage, MatchResponse } from '@/types/match';

interface StageGroupCardProps {
  stage: MatchStage;
  matches: MatchResponse[];
}

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP_STAGE:   'Group Stage',
  ROUND_OF_16:   'Round of 16',
  QUARTER_FINAL: 'Quarter-Finals',
  SEMI_FINAL:    'Semi-Finals',
  THIRD_PLACE:   'Third Place',
  FINAL:         'Final',
};

export function StageGroupCard({ stage, matches }: StageGroupCardProps) {
  const count = matches.length;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {STAGE_LABELS[stage]}
          <span className="text-sm text-muted-foreground ml-1">
            ({count} match{count !== 1 ? 'es' : ''})
          </span>
        </h2>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <MatchCard match={m} key={m.id} />
        ))}
      </div>
    </section>
  );
}
