export interface RankingEntry {
  userId: string;
  username: string;
  totalPoints: number;
  exactScores: number;
  correctOutcomes: number;
  incorrectPredictions: number;
  totalPredictions: number;
  updatedAt: string;
  rank: number;
}

export interface RankingPage {
  content: RankingEntry[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-indexed current page
}

export interface RankingStats {
  totalUsers: number;
  totalPredictions: number;
  totalPointsAwarded: number;
  averagePointsPerUser: number;
  highestScore: number;
  totalExactScores: number;
  totalCorrectOutcomes: number;
  totalIncorrect: number;
}
