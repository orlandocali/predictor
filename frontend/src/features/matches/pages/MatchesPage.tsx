import { useState } from 'react';
import { Loader2, AlertCircle, Trophy, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MatchFilters, MatchStage, MatchStatus } from '@/types/match';
import { useMatches } from '../hooks/useMatches';
import { useGroupedMatches } from '../hooks/useGroupedMatches';
import { MatchCard } from '../components/MatchCard';
import { PageHeader } from '@/components/PageHeader';

const STAGE_LABELS: Record<MatchStage, string> = {
  GROUP_STAGE:   'Group Stage',
  ROUND_OF_16:   'Round of 16',
  QUARTER_FINAL: 'Quarter-Finals',
  SEMI_FINAL:    'Semi-Finals',
  THIRD_PLACE:   'Third Place',
  FINAL:         'Final',
};

const ALL_STAGES: MatchStage[] = [
  'GROUP_STAGE',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL',
];

const ALL_STATUSES: MatchStatus[] = ['SCHEDULED', 'LOCKED', 'FINISHED', 'SCORED'];

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: 'Scheduled',
  LOCKED:    'Locked',
  FINISHED:  'Finished',
  SCORED:    'Scored',
};

const ALL_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn('text-xs h-7 px-3', active && 'font-semibold')}
    >
      {children}
    </Button>
  );
}

export default function MatchesPage() {
  const [filters, setFilters] = useState<MatchFilters>({});

  const hasFilters = filters.stage != null || filters.status != null || filters.group != null;

  const grouped = useGroupedMatches();
  const filtered = useMatches(filters);

  const { data, isLoading, isError } = hasFilters ? filtered : grouped;

  function setStatus(status: MatchStatus | undefined) {
    setFilters((f) => ({ ...f, status }));
  }

  function setStage(stage: MatchStage | undefined) {
    // Clearing stage also clears group (group only applies to GROUP_STAGE)
    setFilters((f) => ({ ...f, stage, group: stage !== 'GROUP_STAGE' ? undefined : f.group }));
  }

  function setGroup(group: string | undefined) {
    // Selecting a group implicitly filters GROUP_STAGE — clear stage filter to avoid conflict
    setFilters((f) => ({ ...f, group, stage: group != null ? undefined : f.stage }));
  }

  const showGroupFilter = filters.stage == null || filters.stage === 'GROUP_STAGE';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Matches"
        description="World Cup 2026 — group stage and knockout fixtures."
        icon={<Trophy className="h-5 w-5" />}
      />

      {/* Filters */}
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        {/* Status filter */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={filters.status == null} onClick={() => setStatus(undefined)}>
              All
            </FilterPill>
            {ALL_STATUSES.map((s) => (
              <FilterPill
                key={s}
                active={filters.status === s}
                onClick={() => setStatus(filters.status === s ? undefined : s)}
              >
                {STATUS_LABELS[s]}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Stage filter */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Stage</p>
          <div className="flex flex-wrap gap-2">
            <FilterPill active={filters.stage == null && filters.group == null} onClick={() => setStage(undefined)}>
              All Stages
            </FilterPill>
            {ALL_STAGES.map((s) => (
              <FilterPill
                key={s}
                active={filters.stage === s}
                onClick={() => setStage(filters.stage === s ? undefined : s)}
              >
                {STAGE_LABELS[s]}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Group filter — only shown when stage is GROUP_STAGE or unset */}
        {showGroupFilter && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Group</p>
            <div className="flex flex-wrap gap-2">
              <FilterPill active={filters.group == null} onClick={() => setGroup(undefined)}>
                All Groups
              </FilterPill>
              {ALL_GROUPS.map((g) => (
                <FilterPill
                  key={g}
                  active={filters.group === g}
                  onClick={() => setGroup(filters.group === g ? undefined : g)}
                >
                  Group {g}
                </FilterPill>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
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
          {/* Flat filtered view */}
          {hasFilters && (
            <>
              {(data as import('@/types/match').MatchResponse[] | undefined)?.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                  {(data as import('@/types/match').MatchResponse[] | undefined)?.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Grouped view */}
          {!hasFilters && (
            <>
              {(data as import('@/types/match').GroupedStage[] | undefined)?.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-10">
                  {(data as import('@/types/match').GroupedStage[] | undefined)?.map((group) => (
                    <section key={group.stage}>
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">{STAGE_LABELS[group.stage]}</h2>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({group.matches.length} match{group.matches.length !== 1 ? 'es' : ''})
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                        {group.matches.map((match) => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
      <Trophy className="h-12 w-12 mb-4 opacity-30" />
      <p className="font-medium">No matches found</p>
      <p className="text-sm mt-1">Try adjusting your filters.</p>
    </div>
  );
}
