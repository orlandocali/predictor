package com.app.service;

import com.app.dto.RankingResponse;
import com.app.dto.RankingStats;
import com.app.model.Ranking;
import com.app.repository.RankingRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public Page<RankingResponse> getLeaderboardPage(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("page must be >= 0");
        }
        if (size < 1) {
            throw new IllegalArgumentException("size must be >= 1");
        }
        if (size > 100) {
            throw new IllegalArgumentException("size must be <= 100");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "totalPoints")
                        .and(Sort.by(Sort.Direction.DESC, "exactScores")));

        Page<Ranking> rankingsPage = rankingRepository.findAll(pageable);
        List<Ranking> pageContent = rankingsPage.getContent();
        List<RankingResponse> content = IntStream.range(0, pageContent.size())
                .mapToObj(index -> {
                    int position = (page * size) + index + 1;
                    return toResponse(pageContent.get(index), position);
                })
                .toList();

        log.info(
                "Fetched leaderboard page {} with size {} ({} users in page, {} total)",
                page,
                size,
                content.size(),
                rankingsPage.getTotalElements());

        return new PageImpl<>(content, pageable, rankingsPage.getTotalElements());
    }

    public List<Ranking> getTopN(int n) {
        if (n < 1) {
            throw new IllegalArgumentException("n must be >= 1");
        }

        log.info("Fetching top {} users from leaderboard", n);
        return getLeaderboard().stream().limit(n).toList();
    }

    public List<RankingResponse> getTopNResponse(int n) {
        if (n < 1) {
            throw new IllegalArgumentException("n must be >= 1");
        }

        List<Ranking> topRankings = getLeaderboard().stream().limit(n).toList();
        List<RankingResponse> responses = IntStream.range(0, topRankings.size())
            .mapToObj(index -> toResponse(topRankings.get(index), index + 1))
                .toList();

        log.info("Fetching top {} users as ranking responses", n);
        return responses;
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

    public Optional<RankingResponse> getUserRankResponse(String userId) {
        List<Ranking> leaderboard = getLeaderboard();

        for (int i = 0; i < leaderboard.size(); i++) {
            Ranking ranking = leaderboard.get(i);
            if (userId.equals(ranking.getUserId())) {
                RankingResponse response = toResponse(ranking, i + 1);
                log.info("User '{}' ranking response found at position {}", userId, i + 1);
                return Optional.of(response);
            }
        }

        log.info("User '{}' ranking response not found", userId);
        return Optional.empty();
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

    private RankingResponse toResponse(Ranking ranking, int position) {
        return RankingResponse.builder()
                .position(position)
                .userId(ranking.getUserId())
                .username(ranking.getUsername())
                .totalPoints(ranking.getTotalPoints())
                .exactScores(ranking.getExactScores())
                .correctOutcomes(ranking.getCorrectOutcomes())
                .incorrectPredictions(ranking.getIncorrectPredictions())
                .totalPredictions(ranking.getTotalPredictions())
                .updatedAt(ranking.getUpdatedAt())
                .build();
    }
}
