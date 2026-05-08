// src/features/tournament/components/KnockoutBracket.tsx
// Visual single-elimination bracket for the knockout rounds.
//
// Layout strategy:
//   - All round columns share the SAME total height (TOTAL_H).
//   - Matches in each column are distributed using `justify-around`, which places
//     each match center at (2k+1) * TOTAL_H / (2n) for k = 0…n-1.
//   - SVG `<line>` elements drawn between adjacent columns connect pairs of
//     matches to the single slot they feed in the next round.
//
// TOTAL_H = firstRound.matchCount * SLOT_H  (SLOT_H = CARD_H + gap = 88px)
// This ensures justify-around produces exactly CARD_H-sized cards with 16px gaps.

import { cn } from '@/lib/utils';
import TeamFlag from '@/components/TeamFlag';
import type { MatchResponse, MatchStage } from '@/types/match';
import type { KnockoutStageData } from '../hooks/useTournamentData';
import { STAGE_LABELS } from '../hooks/useTournamentData';

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W   = 192; // px — width of each match card
const CARD_H   = 72;  // px — height of each match card
const CONN_W   = 28;  // px — width of SVG connector between rounds
const SLOT_H   = 88;  // px — CARD_H + 16px gap (controls justify-around spacing)

/** How many matches each knockout stage is expected to have. */
const EXPECTED_COUNTS: Partial<Record<MatchStage, number>> = {
  ROUND_OF_16:   8,
  QUARTER_FINAL: 4,
  SEMI_FINAL:    2,
  FINAL:         1,
};

/** Stages rendered in the main horizontal bracket (left → right). */
const MAIN_STAGES: MatchStage[] = [
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'FINAL',
];

// ─── Bracket match card ───────────────────────────────────────────────────────

function BracketMatchCard({ match }: { match: MatchResponse | null }) {
  if (!match) {
    return (
      <div
        className="rounded-md border-2 border-dashed border-border/40 bg-muted/5 flex items-center justify-center shrink-0"
        style={{ width: CARD_W, height: CARD_H }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
          TBD
        </span>
      </div>
    );
  }

  const hasResult =
    (match.status === 'SCORED' || match.status === 'FINISHED') &&
    match.result != null;
  const r = match.result;
  const homeWins = hasResult && r != null && r.homeScore > r.awayScore;
  const awayWins = hasResult && r != null && r.awayScore > r.homeScore;
  const halfH = (CARD_H - 1) / 2; // 35.5 px per team row

  return (
    <div
      className="rounded-md border border-border bg-card shadow-sm overflow-hidden shrink-0"
      style={{ width: CARD_W, height: CARD_H }}
    >
      {/* Home team row */}
      <div
        className={cn(
          'flex items-center gap-2 px-2.5',
          homeWins && 'bg-primary/10'
        )}
        style={{ height: halfH }}
      >
        <TeamFlag team={match.homeTeam} size="sm" />
        <span
          className={cn(
            'text-[11px] flex-1 truncate',
            homeWins ? 'font-bold text-foreground' : 'font-medium text-foreground/80'
          )}
        >
          {match.homeTeam}
        </span>
        {hasResult && r != null && (
          <span
            className={cn(
              'text-xs font-bold tabular-nums shrink-0',
              homeWins ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {r.homeScore}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50" />

      {/* Away team row */}
      <div
        className={cn(
          'flex items-center gap-2 px-2.5',
          awayWins && 'bg-primary/10'
        )}
        style={{ height: halfH }}
      >
        <TeamFlag team={match.awayTeam} size="sm" />
        <span
          className={cn(
            'text-[11px] flex-1 truncate',
            awayWins ? 'font-bold text-foreground' : 'font-medium text-foreground/80'
          )}
        >
          {match.awayTeam}
        </span>
        {hasResult && r != null && (
          <span
            className={cn(
              'text-xs font-bold tabular-nums shrink-0',
              awayWins ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {r.awayScore}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SVG connector between two adjacent round columns ─────────────────────────
// Draws ⊢-shaped bracket lines (vertical bar + horizontal stub) connecting
// each pair of "from" matches to the single "to" match they feed.

interface BracketConnectorsProps {
  fromCount: number;
  toCount: number;
  totalH: number;
  width: number;
}

function BracketConnectors({ fromCount, toCount, totalH, width }: BracketConnectorsProps) {
  // Center y-coordinates for each match in "from" and "to" rounds
  const fromCenters = Array.from(
    { length: fromCount },
    (_, k) => ((2 * k + 1) * totalH) / (2 * fromCount)
  );
  const toCenters = Array.from(
    { length: toCount },
    (_, k) => ((2 * k + 1) * totalH) / (2 * toCount)
  );

  return (
    <svg
      width={width}
      height={totalH}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      {toCenters.map((midY, i) => {
        const topY = fromCenters[2 * i];
        const botY = fromCenters[2 * i + 1];
        if (topY == null || botY == null) return null;

        return (
          <g key={i}>
            {/* Vertical bracket bar joining the two "from" match centers */}
            <line
              x1={0} y1={topY}
              x2={0} y2={botY}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
            {/* Horizontal connector from midpoint to the next round */}
            <line
              x1={0} y1={midY}
              x2={width} y2={midY}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Pad matches array with null slots up to the expected count ───────────────

function padMatches(
  stage: MatchStage,
  matches: MatchResponse[]
): (MatchResponse | null)[] {
  const expected = EXPECTED_COUNTS[stage] ?? matches.length;
  const result: (MatchResponse | null)[] = [...matches];
  while (result.length < expected) result.push(null);
  return result;
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface KnockoutBracketProps {
  knockoutStages: KnockoutStageData[];
}

export function KnockoutBracket({ knockoutStages }: KnockoutBracketProps) {
  // Split Third Place out — it's displayed below as a standalone match
  const thirdPlaceStage = knockoutStages.find((s) => s.stage === 'THIRD_PLACE');
  const mainData = knockoutStages.filter((s) =>
    MAIN_STAGES.includes(s.stage)
  );

  if (mainData.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          🏆
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Knockout stage hasn't started yet</p>
          <p className="text-sm text-muted-foreground">
            The bracket will appear once the group stage concludes
          </p>
        </div>
      </div>
    );
  }

  // Build ordered round columns (only stages present in data)
  const rounds = MAIN_STAGES.filter((s) => mainData.some((d) => d.stage === s)).map(
    (stage) => ({
      stage,
      matches: padMatches(
        stage,
        mainData.find((d) => d.stage === stage)?.matches ?? []
      ),
    })
  );

  // Total bracket height — derived from the first (deepest) round
  const firstCount = rounds[0].matches.length;
  const totalH = firstCount * SLOT_H;

  return (
    <div>
      {/* ── Horizontal bracket ── */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="inline-flex flex-col" style={{ minWidth: 'max-content' }}>
          {/* Round labels */}
          <div className="flex mb-3">
            {rounds.map((round, i) => (
              <div key={round.stage} className="flex items-center">
                <div
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  style={{ width: CARD_W }}
                >
                  {STAGE_LABELS[round.stage]}
                </div>
                {i < rounds.length - 1 && (
                  <div style={{ width: CONN_W }} />
                )}
              </div>
            ))}
          </div>

          {/* Bracket columns + connectors */}
          <div className="flex" style={{ height: totalH }}>
            {rounds.map((round, i) => (
              <div key={round.stage} className="flex items-center">
                {/* Match column — justify-around distributes cards evenly */}
                <div
                  className="flex flex-col justify-around"
                  style={{ width: CARD_W, height: totalH }}
                >
                  {round.matches.map((match, j) => (
                    <BracketMatchCard
                      key={match?.id ?? `tbd-${round.stage}-${j}`}
                      match={match}
                    />
                  ))}
                </div>

                {/* SVG connector to next round */}
                {i < rounds.length - 1 && (
                  <BracketConnectors
                    fromCount={round.matches.length}
                    toCount={rounds[i + 1].matches.length}
                    totalH={totalH}
                    width={CONN_W}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Third place playoff ── */}
      {thirdPlaceStage && thirdPlaceStage.matches.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center mb-4">
            Third Place Playoff
          </p>
          <div className="flex justify-center">
            <BracketMatchCard match={thirdPlaceStage.matches[0]} />
          </div>
        </div>
      )}
    </div>
  );
}
