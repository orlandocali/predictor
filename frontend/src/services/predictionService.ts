import { apiGet, apiPost } from '@/services/api';
import type { PredictionResponse, CreatePredictionRequest } from '@/types/prediction';

export const predictionService = {
  getUserPredictions(): Promise<PredictionResponse[]> {
    return apiGet<PredictionResponse[]>('/api/v1/predictions');
  },

  getPredictionByMatch(matchId: string): Promise<PredictionResponse> {
    return apiGet<PredictionResponse>(`/api/v1/predictions/match/${matchId}`);
  },

  submitPrediction(data: CreatePredictionRequest): Promise<PredictionResponse> {
    return apiPost<CreatePredictionRequest, PredictionResponse>('/api/v1/predictions', data);
  },
};