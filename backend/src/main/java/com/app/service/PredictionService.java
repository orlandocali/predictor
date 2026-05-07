package com.app.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.app.dto.PredictionResponse;
import com.app.dto.SubmitPredictionRequest;
import com.app.exception.PredictionLockedException;
import com.app.exception.ResourceNotFoundException;
import com.app.model.Match;
import com.app.model.MatchStatus;
import com.app.model.Prediction;
import com.app.repository.MatchRepository;
import com.app.repository.PredictionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final MatchRepository matchRepository;

    public PredictionService(PredictionRepository predictionRepository, MatchRepository matchRepository) {
        this.predictionRepository = predictionRepository;
        this.matchRepository = matchRepository;
    }

    public PredictionResponse submitPrediction(String userId, SubmitPredictionRequest request) {
        String matchId = request.getMatchId();
        log.debug("Fetching match id '{}' for prediction submission by user '{}'", matchId, userId);

        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getStatus() == MatchStatus.LOCKED
                || match.getStatus() == MatchStatus.FINISHED
                || match.getStatus() == MatchStatus.SCORED) {
            throw new PredictionLockedException("Predictions are closed for this match");
        }

        Instant lockDeadline = match.getKickoffAt().minus(12, ChronoUnit.HOURS);
        if (Instant.now().isAfter(lockDeadline)) {
            throw new PredictionLockedException("Prediction window has closed (12 hours before kickoff)");
        }

        Prediction saved = predictionRepository.findByUserIdAndMatchId(userId, matchId)
                .map(existing -> {
                    existing.setPredictedHomeScore(request.getPredictedHomeScore());
                    existing.setPredictedAwayScore(request.getPredictedAwayScore());
                    existing.setPredictedPenaltyWinner(request.getPredictedPenaltyWinner());
                    log.info("Updating prediction for user '{}' and match '{}'", userId, matchId);
                    return predictionRepository.save(existing);
                })
                .orElseGet(() -> {
                    Prediction prediction = Prediction.builder()
                            .userId(userId)
                            .matchId(matchId)
                            .predictedHomeScore(request.getPredictedHomeScore())
                            .predictedAwayScore(request.getPredictedAwayScore())
                            .predictedPenaltyWinner(request.getPredictedPenaltyWinner())
                            .build();
                    log.info("Creating prediction for user '{}' and match '{}'", userId, matchId);
                    return predictionRepository.save(prediction);
                });

        return toResponse(saved);
    }

    public List<PredictionResponse> getPredictionsByUser(String userId) {
        log.debug("Fetching predictions for user '{}'", userId);
        return predictionRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public PredictionResponse getPredictionByUserAndMatch(String userId, String matchId) {
        log.debug("Fetching prediction for user '{}' and match '{}'", userId, matchId);
        Prediction prediction = predictionRepository.findByUserIdAndMatchId(userId, matchId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Prediction not found for user " + userId + " and match " + matchId));
        return toResponse(prediction);
    }

    public void lockPredictionsForMatch(String matchId) {
        log.debug("Locking predictions for match '{}'", matchId);
        List<Prediction> predictions = predictionRepository.findByMatchId(matchId);
        predictions.forEach(prediction -> prediction.setLocked(true));
        predictionRepository.saveAll(predictions);
        log.info("Locked {} predictions for match '{}'", predictions.size(), matchId);
    }

    private PredictionResponse toResponse(Prediction prediction) {
        return PredictionResponse.builder()
                .id(prediction.getId())
                .userId(prediction.getUserId())
                .matchId(prediction.getMatchId())
                .predictedHomeScore(prediction.getPredictedHomeScore())
                .predictedAwayScore(prediction.getPredictedAwayScore())
                .predictedPenaltyWinner(prediction.getPredictedPenaltyWinner())
                .locked(prediction.isLocked())
                .pointsEarned(prediction.getPointsEarned())
                .createdAt(prediction.getCreatedAt())
                .updatedAt(prediction.getUpdatedAt())
                .build();
    }
}
