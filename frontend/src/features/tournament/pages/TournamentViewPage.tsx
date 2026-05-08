// src/features/tournament/pages/TournamentViewPage.tsx
// Main tournament visualization page.
//
// Tab 1 — Group Stage: a responsive grid of GroupTable components, one per group.
// Tab 2 — Knockout Bracket: a horizontally-scrollable KnockoutBracket component.
//
// A single /api/v1/matches/grouped call is shared between both tabs via the
// useTournamentData hook (backed by the existing useGroupedMatches query).

import { useState } from 'react';
import { AlertCircle, LayoutGrid, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import { GroupTable } from '../components/GroupTable';
import { KnockoutBracket } from '../components/KnockoutBracket';
import { useTournamentData } from '../hooks/useTournamentData';

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'groups' | 'knockout';

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function GroupsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border overflow-hidden">
          <div className="h-10 bg-muted/40 border-b border-border px-4 py-2.5">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="p-0">
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0"
              >
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-28 flex-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketSkeleton() {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-7" style={{ minWidth: 'max-content', height: 350 }}>
        {[4, 2, 1].map((count, col) => (
          <div key={col} className="flex flex-col justify-around" style={{ width: 192 }}>
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} className="rounded-md" style={{ width: 192, height: 72 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty states ──────────────────────────────────────────────────────────────

function NoGroupsState() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-2xl">
        📋
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground">No group matches yet</p>
        <p className="text-sm text-muted-foreground">
          Group stage matches will appear here once they have been added.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TournamentViewPage() {
  const [activeTab, setActiveTab] = useState<Tab>('groups');
  const {
    groupStandings,
    knockoutStages,
    hasGroupMatches,
    hasKnockoutMatches,
    isLoading,
    isError,
    refetch,
  } = useTournamentData();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-screen-xl">
      <PageHeader
        title="Tournament"
        description="FIFA World Cup 2026 — group standings and knockout bracket"
        icon={<Trophy className="h-5 w-5" />}
      />

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-0">
        <TabButton
          active={activeTab === 'groups'}
          onClick={() => setActiveTab('groups')}
          icon={<LayoutGrid className="h-3.5 w-3.5" />}
        >
          Group Stage
        </TabButton>
        <TabButton
          active={activeTab === 'knockout'}
          onClick={() => setActiveTab('knockout')}
          icon={<Trophy className="h-3.5 w-3.5" />}
        >
          Knockout Bracket
          {hasKnockoutMatches && (
            <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary leading-none">
              {knockoutStages.reduce((n, s) => n + s.matches.length, 0)}
            </span>
          )}
        </TabButton>
      </div>

      {/* ── Error state ── */}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-4">
            Failed to load tournament data.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-7 px-3 text-xs"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Group Stage tab ── */}
      {activeTab === 'groups' && (
        <>
          {isLoading ? (
            <GroupsSkeleton />
          ) : !hasGroupMatches ? (
            <NoGroupsState />
          ) : (
            <>
              {/* Legend */}
              <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-primary/20 border border-primary/30" />
                  Qualifies to Round of 16
                </span>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {groupStandings.map(({ group, matches }) => (
                  <GroupTable
                    key={group}
                    group={group}
                    matches={matches}
                    qualifyingSpots={2}
                  />
                ))}
              </div>

              {/* Column headers legend (mobile note) */}
              <p className="mt-4 text-[10px] text-muted-foreground sm:hidden">
                GF/GA columns visible on wider screens. P=Played · W=Won · D=Drawn · L=Lost · GD=Goal diff · Pts=Points
              </p>
            </>
          )}
        </>
      )}

      {/* ── Knockout Bracket tab ── */}
      {activeTab === 'knockout' && (
        <>
          {isLoading ? (
            <BracketSkeleton />
          ) : (
            <KnockoutBracket knockoutStages={knockoutStages} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'relative h-10 rounded-none border-b-2 px-4 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      )}
    >
      <span className="flex items-center gap-1.5">
        {icon}
        {children}
      </span>
    </Button>
  );
}
