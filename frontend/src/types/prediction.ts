export interface PredictionResponse {
  id: string;
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedPenaltyWinner?: string;
  locked: boolean;
  pointsEarned?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePredictionRequest {
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedPenaltyWinner?: string;
}
