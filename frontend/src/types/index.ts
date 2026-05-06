export interface HealthResponse {
  status: string;
  service: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  status: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Prediction {
  id: string;
  matchId: string;
  userId: string;
  homeScore: number;
  awayScore: number;
}