package com.app.service;

import com.app.dto.RankingStats;
import com.app.model.Ranking;
import com.app.repository.RankingRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankingAggregationService {

    private final RankingRepository rankingRepository;
    private final RankingService rankingService;

    public List<Ranking> getLeaderboard() {
        List<Ranking> leaderboard = rankingService.getRankings();
        log.info("Fetching leaderboard ({} users)", leaderboard.size());
        return leaderboard;
    }

    public List<Ranking> getTopN(int n) {
        if (n < 1) {
            throw new IllegalArgumentException("n must be >= 1");
        }

        log.info("Fetching top {} users from leaderboard", n);
        return getLeaderboard().stream().limit(n).toList();
    }

    public int getUserRankPosition(String userId) {
        List<Ranking> leaderboard = getLeaderboard();
        int position = -1;

        for (int i = 0; i < leaderboard.size(); i++) {
            Ranking ranking = leaderboard.get(i);
            if (userId.equals(ranking.getUserId())) {
                position = i + 1;
                break;
            }
        }

        log.info("User '{}' rank position: {}", userId, position);
        return position;
    }

    public RankingStats getStats() {
        List<Ranking> rankings = rankingRepository.findAllByOrderByTotalPointsDescExactScoresDesc();

        int totalUsers = rankings.size();
        int totalPredictions = rankings.stream().mapToInt(Ranking::getTotalPredictions).sum();
        int totalPointsAwarded = rankings.stream().mapToInt(Ranking::getTotalPoints).sum();

        double averagePointsPerUser = totalUsers == 0
                ? 0.0
                : Math.round(((double) totalPointsAwarded / totalUsers) * 100.0) / 100.0;

        int highestScore = rankings.stream().mapToInt(Ranking::getTotalPoints).max().orElse(0);
        int totalExactScores = rankings.stream().mapToInt(Ranking::getExactScores).sum();
        int totalCorrectOutcomes = rankings.stream().mapToInt(Ranking::getCorrectOutcomes).sum();
        int totalIncorrect = rankings.stream().mapToInt(Ranking::getIncorrectPredictions).sum();

        log.info("Computed ranking stats: {} users, {} total points", totalUsers, totalPointsAwarded);

        return RankingStats.builder()
                .totalUsers(totalUsers)
                .totalPredictions(totalPredictions)
                .totalPointsAwarded(totalPointsAwarded)
                .averagePointsPerUser(averagePointsPerUser)
                .highestScore(highestScore)
                .totalExactScores(totalExactScores)
                .totalCorrectOutcomes(totalCorrectOutcomes)
                .totalIncorrect(totalIncorrect)
                .build();
    }
}
