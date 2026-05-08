package com.app.service;

import com.app.dto.MatchResponse;
import com.app.dto.MatchResultRequest;
import com.app.dto.ScoringResult;
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

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class ScoringEngine {

    private final MatchRepository matchRepository;
    private final PredictionRepository predictionRepository;
    private final MatchService matchService;
    private final MatchMapper matchMapper;
    private final RankingService rankingService;

    public ScoringEngine(MatchRepository matchRepository,
                         PredictionRepository predictionRepository,
                         MatchService matchService,
                         MatchMapper matchMapper,
                         RankingService rankingService) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.matchService = matchService;
        this.matchMapper = matchMapper;
        this.rankingService = rankingService;
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

        List<ScoringResult> scoringResults = scorePredictions(match, result);
        rankingService.updateRankingsForMatch(matchId, scoringResults);

        matchService.updateMatchStatus(matchId, MatchStatus.SCORED);
        log.info("Match '{}' transitioned to SCORED", matchId);

        Match scored = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found after scoring: " + matchId));
        return matchMapper.toResponse(scored);
    }

    public void scoreMatchFromSavedResult(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getResult() == null) {
            throw new IllegalStateException("Match '" + matchId + "' has no result saved");
        }

        if (match.getStatus() != MatchStatus.FINISHED) {
            throw new IllegalArgumentException(
                    "Match must be in FINISHED status to submit result, current: " + match.getStatus());
        }

        List<ScoringResult> scoringResults = scorePredictions(match, match.getResult());
        rankingService.updateRankingsForMatch(matchId, scoringResults);

        matchService.updateMatchStatus(matchId, MatchStatus.SCORED);
        log.info("Match '{}' scored from saved result and transitioned to SCORED", matchId);
    }

    private List<ScoringResult> scorePredictions(Match match, MatchResult result) {
        List<Prediction> predictions = predictionRepository.findByMatchId(match.getId());
        if (predictions.isEmpty()) {
            log.info("No predictions found for match '{}', skipping scoring", match.getId());
            return List.of();
        }

        boolean isKnockout = match.getStage() != MatchStage.GROUP_STAGE;
        List<ScoringResult> scoringResults = new ArrayList<>();

        for (Prediction prediction : predictions) {
            ScoringResult scoringResult = calculatePoints(prediction, result, match, isKnockout);
            prediction.setPointsEarned(scoringResult.getPointsEarned());
            scoringResults.add(scoringResult);
        }

        predictionRepository.saveAll(predictions);
        log.info("Scored {} predictions for match '{}'", predictions.size(), match.getId());
        return scoringResults;
    }

    private ScoringResult calculatePoints(Prediction p, MatchResult r, Match match, boolean isKnockout) {
        int ph = p.getPredictedHomeScore() != null ? p.getPredictedHomeScore() : 0;
        int pa = p.getPredictedAwayScore() != null ? p.getPredictedAwayScore() : 0;
        int ah = r.getHomeScore();
        int aa = r.getAwayScore();

        String predictedPenaltyWinner = p.getPredictedPenaltyWinner();
        String actualPenaltyWinner = r.getPenaltyWinner();

        int points;
        ScoringResult.PointsBreakdown breakdown;

        if (!isKnockout) {
            if (ph == ah && pa == aa) {
                points = 3;
                breakdown = ScoringResult.PointsBreakdown.EXACT_SCORE;
            } else if (Integer.signum(ph - pa) == Integer.signum(ah - aa)) {
                points = 1;
                breakdown = ScoringResult.PointsBreakdown.CORRECT_OUTCOME;
            } else {
                points = 0;
                breakdown = ScoringResult.PointsBreakdown.INCORRECT;
            }

            return ScoringResult.builder()
                    .matchId(match.getId())
                    .userId(p.getUserId())
                    .predictedHomeScore(p.getPredictedHomeScore())
                    .predictedAwayScore(p.getPredictedAwayScore())
                    .actualHomeScore(ah)
                    .actualAwayScore(aa)
                    .predictedPenaltyWinner(predictedPenaltyWinner)
                    .actualPenaltyWinner(actualPenaltyWinner)
                    .pointsEarned(points)
                    .breakdown(breakdown)
                    .build();
        }

        // Knockout: determine actual winner
        String actualWinner;
        // Use explicit qualifyingTeam when available (set by KnockoutScoringService)
        if (r.getQualifyingTeam() != null) {
            actualWinner = r.getQualifyingTeam();
        } else if (ah > aa) {
            actualWinner = match.getHomeTeam();
        } else if (aa > ah) {
            actualWinner = match.getAwayTeam();
        } else {
            actualWinner = actualPenaltyWinner;
        }

        // Knockout: determine predicted winner
        String predictedWinner;
        if (ph > pa) {
            predictedWinner = match.getHomeTeam();
        } else if (pa > ph) {
            predictedWinner = match.getAwayTeam();
        } else {
            predictedWinner = predictedPenaltyWinner;
        }

        // 3pts: exact score AND correct penalty winner (or no penalty involved)
        boolean exactScore = (ph == ah && pa == aa);
        boolean penaltyCorrect = (actualPenaltyWinner == null)
                || actualPenaltyWinner.equals(predictedPenaltyWinner);
        if (exactScore && penaltyCorrect) {
            points = 3;
            breakdown = ScoringResult.PointsBreakdown.EXACT_SCORE;
        } else if (actualWinner != null && actualWinner.equals(predictedWinner)) {
            points = 1;
            breakdown = ScoringResult.PointsBreakdown.CORRECT_OUTCOME;
        } else {
            points = 0;
            breakdown = ScoringResult.PointsBreakdown.INCORRECT;
        }

        return ScoringResult.builder()
                .matchId(match.getId())
                .userId(p.getUserId())
                .predictedHomeScore(p.getPredictedHomeScore())
                .predictedAwayScore(p.getPredictedAwayScore())
                .actualHomeScore(ah)
                .actualAwayScore(aa)
                .predictedPenaltyWinner(predictedPenaltyWinner)
                .actualPenaltyWinner(actualPenaltyWinner)
                .pointsEarned(points)
                .breakdown(breakdown)
                .build();
    }
}
