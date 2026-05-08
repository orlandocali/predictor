// src/features/tournament/components/GroupTable.tsx
// Displays the standings table for a single group.
// Standings are computed locally from the match results already embedded in the
// MatchResponse objects — no additional API calls needed.

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TeamFlag from '@/components/TeamFlag';
import { cn } from '@/lib/utils';
import type { MatchResponse } from '@/types/match';

// ─── Standings computation ────────────────────────────────────────────────────

interface TeamStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

function computeStandings(matches: MatchResponse[]): TeamStanding[] {
  const map = new Map<string, TeamStanding>();

  const ensure = (team: string): TeamStanding => {
    if (!map.has(team)) {
      map.set(team, {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    }
    return map.get(team)!;
  };

  for (const match of matches) {
    // Ensure every team appears even with no played matches
    ensure(match.homeTeam);
    ensure(match.awayTeam);

    if (
      (match.status === 'SCORED' || match.status === 'FINISHED') &&
      match.result != null
    ) {
      const { homeScore, awayScore } = match.result;
      const home = ensure(match.homeTeam);
      const away = ensure(match.awayTeam);

      home.played++;
      away.played++;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (awayScore > homeScore) {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        home.points++;
        away.drawn++;
        away.points++;
      }
    }
  }

  for (const s of map.values()) {
    s.goalDifference = s.goalsFor - s.goalsAgainst;
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface GroupTableProps {
  group: string;
  matches: MatchResponse[];
  /** How many top-placed teams automatically qualify (highlighted with amber tint). */
  qualifyingSpots?: number;
}

export function GroupTable({ group, matches, qualifyingSpots = 2 }: GroupTableProps) {
  const standings = useMemo(() => computeStandings(matches), [matches]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-extrabold leading-none" aria-hidden="true">
            ⚽
          </span>
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            {group}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/10 hover:bg-muted/10">
              <TableHead className="w-7 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-2">#</TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 pl-2 pr-3">Team</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-8">P</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-8">W</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-8">D</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-8">L</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-8 hidden sm:table-cell">GF</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-8 hidden sm:table-cell">GA</TableHead>
              <TableHead className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground py-2 px-1.5 w-10">GD</TableHead>
              <TableHead className="text-center text-[10px] font-bold uppercase tracking-wide text-foreground py-2 px-2 w-10">Pts</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {standings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-xs text-muted-foreground py-6">
                  No matches played yet
                </TableCell>
              </TableRow>
            ) : (
              standings.map((team, idx) => {
                const isQualifying = idx < qualifyingSpots;
                const isQualifyingBorder = idx === qualifyingSpots - 1;

                return (
                  <TableRow
                    key={team.team}
                    className={cn(
                      'transition-colors',
                      isQualifying
                        ? 'bg-primary/5 hover:bg-primary/10'
                        : 'hover:bg-muted/30',
                      isQualifyingBorder && 'border-b-2 border-primary/25'
                    )}
                  >
                    <TableCell className="text-center text-xs text-muted-foreground py-2.5 px-2 font-medium">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="py-2.5 pl-2 pr-3">
                      <div className="flex items-center gap-2">
                        <TeamFlag team={team.team} size="sm" />
                        <span className="text-xs font-medium truncate max-w-[90px] sm:max-w-[140px]">
                          {team.team}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center text-xs tabular-nums py-2.5 px-1.5 text-muted-foreground">{team.played}</TableCell>
                    <TableCell className="text-center text-xs tabular-nums py-2.5 px-1.5 font-semibold text-emerald-600 dark:text-emerald-400">{team.won}</TableCell>
                    <TableCell className="text-center text-xs tabular-nums py-2.5 px-1.5 text-muted-foreground">{team.drawn}</TableCell>
                    <TableCell className="text-center text-xs tabular-nums py-2.5 px-1.5 text-rose-500 dark:text-rose-400">{team.lost}</TableCell>
                    <TableCell className="text-center text-xs tabular-nums py-2.5 px-1.5 hidden sm:table-cell">{team.goalsFor}</TableCell>
                    <TableCell className="text-center text-xs tabular-nums py-2.5 px-1.5 hidden sm:table-cell">{team.goalsAgainst}</TableCell>
                    <TableCell
                      className={cn(
                        'text-center text-xs tabular-nums py-2.5 px-1.5 font-medium',
                        team.goalDifference > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : team.goalDifference < 0
                          ? 'text-rose-500 dark:text-rose-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </TableCell>
                    <TableCell className="text-center text-sm tabular-nums py-2.5 px-2 font-bold">
                      {team.points}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
