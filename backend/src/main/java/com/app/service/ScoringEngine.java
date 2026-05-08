package com.app.service;

import com.app.dto.MatchResponse;
import com.app.dto.MatchResultRequest;
import com.app.exception.ResourceNotFoundException;
import com.app.mapper.MatchMapper;
import com.app.model.Match;
import com.app.model.MatchResult;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.model.Prediction;
import com.app.repository.MatchRepository;
import com.app.repository.PredictionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ScoringEngine {

    private final MatchRepository matchRepository;
    private final PredictionRepository predictionRepository;
    private final MatchService matchService;
    private final MatchMapper matchMapper;

    public ScoringEngine(MatchRepository matchRepository,
                         PredictionRepository predictionRepository,
                         MatchService matchService,
                         MatchMapper matchMapper) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.matchService = matchService;
        this.matchMapper = matchMapper;
    }

    public MatchResponse submitResult(String matchId, MatchResultRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getStatus() != MatchStatus.FINISHED) {
            throw new IllegalArgumentException(
                    "Match must be in FINISHED status to submit result, current: " + match.getStatus());
        }

        boolean isKnockout = match.getStage() != MatchStage.GROUP_STAGE;
        if (isKnockout
                && request.getHomeScore().equals(request.getAwayScore())
                && (request.getPenaltyWinner() == null || request.getPenaltyWinner().isBlank())) {
            throw new IllegalArgumentException(
                    "penaltyWinner is required for knockout matches with a drawn score");
        }

        MatchResult result = MatchResult.builder()
                .homeScore(request.getHomeScore())
                .awayScore(request.getAwayScore())
                .penaltyWinner(request.getPenaltyWinner())
                .extraTimeHomeScore(request.getExtraTimeHomeScore())
                .extraTimeAwayScore(request.getExtraTimeAwayScore())
                .build();

        match.setResult(result);
        matchRepository.save(match);
        log.info("Result saved for match '{}': {}-{}{}", matchId,
                result.getHomeScore(), result.getAwayScore(),
                result.getPenaltyWinner() != null ? " (pen: " + result.getPenaltyWinner() + ")" : "");

        scorePredictions(match, result);

        matchService.updateMatchStatus(matchId, MatchStatus.SCORED);
        log.info("Match '{}' transitioned to SCORED", matchId);

        Match scored = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found after scoring: " + matchId));
        return matchMapper.toResponse(scored);
    }

    private void scorePredictions(Match match, MatchResult result) {
        List<Prediction> predictions = predictionRepository.findByMatchId(match.getId());
        if (predictions.isEmpty()) {
            log.info("No predictions found for match '{}', skipping scoring", match.getId());
            return;
        }

        boolean isKnockout = match.getStage() != MatchStage.GROUP_STAGE;
        for (Prediction prediction : predictions) {
            int points = calculatePoints(prediction, result, match, isKnockout);
            prediction.setPointsEarned(points);
        }

        predictionRepository.saveAll(predictions);
        log.info("Scored {} predictions for match '{}'", predictions.size(), match.getId());
    }

    private int calculatePoints(Prediction p, MatchResult r, Match match, boolean isKnockout) {
        int ph = p.getPredictedHomeScore() != null ? p.getPredictedHomeScore() : 0;
        int pa = p.getPredictedAwayScore() != null ? p.getPredictedAwayScore() : 0;
        int ah = r.getHomeScore();
        int aa = r.getAwayScore();

        if (!isKnockout) {
            if (ph == ah && pa == aa) return 3;
            if (Integer.signum(ph - pa) == Integer.signum(ah - aa)) return 1;
            return 0;
        }

        // Knockout: determine actual winner
        String actualWinner;
        if (ah > aa) {
            actualWinner = match.getHomeTeam();
        } else if (aa > ah) {
            actualWinner = match.getAwayTeam();
        } else {
            actualWinner = r.getPenaltyWinner();
        }

        // Knockout: determine predicted winner
        String predictedWinner;
        if (ph > pa) {
            predictedWinner = match.getHomeTeam();
        } else if (pa > ph) {
            predictedWinner = match.getAwayTeam();
        } else {
            predictedWinner = p.getPredictedPenaltyWinner();
        }

        // 3pts: exact score AND correct penalty winner (or no penalty involved)
        boolean exactScore = (ph == ah && pa == aa);
        boolean penaltyCorrect = (r.getPenaltyWinner() == null)
                || r.getPenaltyWinner().equals(p.getPredictedPenaltyWinner());
        if (exactScore && penaltyCorrect) return 3;

        // 1pt: correct match winner
        if (actualWinner != null && actualWinner.equals(predictedWinner)) return 1;
        return 0;
    }
}
