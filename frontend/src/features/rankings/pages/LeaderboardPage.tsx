import { useState } from "react";
import { Trophy, Medal, ChevronLeft, ChevronRight, Award, TrendingUp } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useLeaderboard, useCurrentUserRank } from "@/features/rankings/hooks/useLeaderboard";
import { useAuth } from "@/features/auth/useAuth";
import type { RankingEntry } from "@/types/ranking";

const PAGE_SIZE = 20;

// ─── Rank badge ──────────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-950 shadow-sm">
        <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm">
        <Medal className="h-3.5 w-3.5" aria-hidden="true" />
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-300 px-2.5 py-0.5 text-xs font-bold text-orange-950 shadow-sm">
        <Award className="h-3.5 w-3.5" aria-hidden="true" />
        3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
      {rank}
    </span>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-8 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="hidden sm:table-cell">
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell className="hidden lg:table-cell">
            <Skeleton className="h-4 w-10" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={6}>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <Trophy className="h-8 w-8 text-amber-400" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">No rankings yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to make predictions!
            </p>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Your position card ───────────────────────────────────────────────────────

function YourPositionCard() {
  const { data, isLoading } = useCurrentUserRank();

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Your Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Skeleton className="h-10 w-14" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Your Position
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tabular-nums text-amber-600 dark:text-amber-400">
              #{data.rank}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Username</span>
            <span className="font-semibold">{data.username}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Points</span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {data.totalPoints.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: RankingEntry;
  isCurrentUser: boolean;
}) {
  return (
    <TableRow
      className={
        isCurrentUser
          ? "bg-amber-50 font-semibold hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
          : undefined
      }
      aria-current={isCurrentUser ? "true" : undefined}
    >
      <TableCell className="w-14 py-3">
        <RankBadge rank={entry.rank} />
      </TableCell>
      <TableCell className="py-3">
        <span
          className={
            isCurrentUser
              ? "font-bold text-amber-700 dark:text-amber-400"
              : "text-foreground"
          }
        >
          {entry.username}
          {isCurrentUser && (
            <Badge
              variant="outline"
              className="ml-2 border-amber-400 bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            >
              You
            </Badge>
          )}
        </span>
      </TableCell>
      <TableCell className="py-3 tabular-nums">
        <span className="font-bold">{entry.totalPoints.toLocaleString()}</span>
      </TableCell>
      <TableCell className="hidden py-3 tabular-nums sm:table-cell">
        {entry.exactScores}
      </TableCell>
      <TableCell className="hidden py-3 tabular-nums md:table-cell">
        {entry.correctOutcomes}
      </TableCell>
      <TableCell className="hidden py-3 tabular-nums lg:table-cell">
        {entry.totalPredictions}
      </TableCell>
    </TableRow>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [page, setPage] = useState(0);
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading } = useLeaderboard({ page, size: PAGE_SIZE });

  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.number ?? page;
  const entries = data?.content ?? [];

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
          <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Leaderboard
          </h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              {data.totalElements.toLocaleString()} player
              {data.totalElements !== 1 ? "s" : ""} ranked
            </p>
          )}
        </div>
      </div>

      {/* Current user card */}
      {isAuthenticated && <YourPositionCard />}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 text-xs">#</TableHead>
                <TableHead className="text-xs">Player</TableHead>
                <TableHead className="text-xs">Points</TableHead>
                <TableHead className="hidden text-xs sm:table-cell">Exact</TableHead>
                <TableHead className="hidden text-xs md:table-cell">Correct</TableHead>
                <TableHead className="hidden text-xs lg:table-cell">
                  Total Predictions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : entries.length === 0 ? (
                <EmptyState />
              ) : (
                entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.userId}
                    entry={entry}
                    isCurrentUser={entry.username === user?.username}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={isFirstPage}
            aria-label="Previous page"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
            Prev
          </Button>

          <span className="text-sm tabular-nums text-muted-foreground">
            Page{" "}
            <span className="font-semibold text-foreground">
              {currentPage + 1}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={isLastPage}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}