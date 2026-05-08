package com.app.service;

import com.app.dto.ScoringResult;
import com.app.model.Prediction;
import com.app.model.Ranking;
import com.app.repository.PredictionRepository;
import com.app.repository.RankingRepository;
import com.app.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class RankingService {

    private final RankingRepository rankingRepository;
    private final PredictionRepository predictionRepository;
    private final UserRepository userRepository;

    public RankingService(RankingRepository rankingRepository,
                          PredictionRepository predictionRepository,
                          UserRepository userRepository) {
        this.rankingRepository = rankingRepository;
        this.predictionRepository = predictionRepository;
        this.userRepository = userRepository;
    }

    public List<Ranking> getRankings() {
        return rankingRepository.findAllByOrderByTotalPointsDescExactScoresDesc();
    }

    public Optional<Ranking> getUserRanking(String userId) {
        return rankingRepository.findByUserId(userId);
    }

    public void updateRankingsForMatch(String matchId, List<ScoringResult> scoringResults) {
        for (ScoringResult result : scoringResults) {
            Ranking ranking = rankingRepository.findByUserId(result.getUserId())
                    .orElseGet(() -> Ranking.builder()
                            .userId(result.getUserId())
                            .username(resolveUsername(result.getUserId()))
                            .totalPoints(0)
                            .exactScores(0)
                            .correctOutcomes(0)
                            .incorrectPredictions(0)
                            .totalPredictions(0)
                            .build());

            ranking.setTotalPoints(ranking.getTotalPoints() + result.getPointsEarned());
            ranking.setTotalPredictions(ranking.getTotalPredictions() + 1);

            if (result.getBreakdown() == ScoringResult.PointsBreakdown.EXACT_SCORE) {
                ranking.setExactScores(ranking.getExactScores() + 1);
            } else if (result.getBreakdown() == ScoringResult.PointsBreakdown.CORRECT_OUTCOME) {
                ranking.setCorrectOutcomes(ranking.getCorrectOutcomes() + 1);
            } else {
                ranking.setIncorrectPredictions(ranking.getIncorrectPredictions() + 1);
            }

            Ranking saved = rankingRepository.save(ranking);
            log.info("Updated ranking for user '{}': +{} pts (total: {})",
                    saved.getUserId(), result.getPointsEarned(), saved.getTotalPoints());
        }

        log.info("Processed ranking updates for match '{}' ({} scoring results)", matchId, scoringResults.size());
    }

    public void rebuildAllRankings() {
        log.info("Starting full ranking rebuild");
        rankingRepository.deleteAll();

        List<Prediction> predictions = predictionRepository.findAll();
        Set<String> userIds = predictions.stream()
                .map(Prediction::getUserId)
                .filter(userId -> userId != null && !userId.isBlank())
                .collect(Collectors.toSet());

        log.info("Rebuilding rankings for {} users", userIds.size());

        for (String userId : userIds) {
            List<Prediction> userPredictions = predictions.stream()
                    .filter(prediction -> userId.equals(prediction.getUserId()))
                    .toList();

            int totalPoints = userPredictions.stream()
                    .map(Prediction::getPointsEarned)
                    .map(points -> points != null ? points : 0)
                    .reduce(0, Integer::sum);

            int exactScores = 0;
            int correctOutcomes = 0;
            int incorrectPredictions = 0;

            for (Prediction prediction : userPredictions) {
                Integer points = prediction.getPointsEarned();
                if (points != null && points == 3) {
                    exactScores++;
                } else if (points != null && points == 1) {
                    correctOutcomes++;
                } else {
                    incorrectPredictions++;
                }
            }

            Ranking ranking = Ranking.builder()
                    .userId(userId)
                    .username(resolveUsername(userId))
                    .totalPoints(totalPoints)
                    .exactScores(exactScores)
                    .correctOutcomes(correctOutcomes)
                    .incorrectPredictions(incorrectPredictions)
                    .totalPredictions(userPredictions.size())
                    .build();

            rankingRepository.save(ranking);
        }

        log.info("Completed full ranking rebuild for {} users", userIds.size());
    }

    private String resolveUsername(String userId) {
        return userRepository.findById(userId)
                .map(user -> user.getUsername() != null && !user.getUsername().isBlank() ? user.getUsername() : userId)
                .orElse(userId);
    }
}
