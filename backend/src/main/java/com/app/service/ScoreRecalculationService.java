package com.app.service;

import com.app.dto.RecalculationResult;
import com.app.dto.ScoringResult;
import com.app.exception.ResourceNotFoundException;
import com.app.model.Match;
import com.app.model.MatchStatus;
import com.app.repository.MatchRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreRecalculationService {

    private final MatchRepository matchRepository;
    private final ScoringEngine scoringEngine;
    private final RankingService rankingService;

    public RecalculationResult recalculateMatch(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getResult() == null) {
            throw new IllegalStateException("Match '" + matchId + "' has no result to recalculate");
        }

        if (match.getStatus() != MatchStatus.SCORED) {
            throw new IllegalArgumentException(
                    "Match must be in SCORED status to recalculate, current: " + match.getStatus());
        }

        List<ScoringResult> results = scoringEngine.rescoreMatchPredictions(matchId);
        rankingService.rebuildAllRankings();

        log.info("Recalculated match '{}': {} predictions rescored, rankings rebuilt", matchId, results.size());

        return RecalculationResult.builder()
                .matchId(matchId)
                .matchesProcessed(1)
                .predictionsScored(results.size())
                .message("Recalculated " + results.size() + " predictions for match '" + matchId + "', rankings rebuilt")
                .build();
    }

    public RecalculationResult recalculateAll() {
        List<Match> scoredMatches = matchRepository.findByStatus(MatchStatus.SCORED);

        if (scoredMatches.isEmpty()) {
            log.warn("No scored matches found to recalculate");
            return RecalculationResult.builder()
                    .matchId(null)
                    .matchesProcessed(0)
                    .predictionsScored(0)
                    .message("No scored matches found to recalculate")
                    .build();
        }

        int matchesProcessed = 0;
        int predictionsScored = 0;

        for (Match match : scoredMatches) {
            if (match.getResult() == null) {
                log.warn("Match '{}' is SCORED but has no result, skipping", match.getId());
                continue;
            }

            List<ScoringResult> results = scoringEngine.rescoreMatchPredictions(match.getId());
            matchesProcessed++;
            predictionsScored += results.size();
        }

        rankingService.rebuildAllRankings();

        log.info("Recalculated all {} scored matches ({} predictions), rankings rebuilt",
                matchesProcessed, predictionsScored);

        return RecalculationResult.builder()
                .matchId(null)
                .matchesProcessed(matchesProcessed)
                .predictionsScored(predictionsScored)
                .message("Recalculated " + matchesProcessed + " matches (" + predictionsScored
                        + " predictions), rankings rebuilt")
                .build();
    }
}
