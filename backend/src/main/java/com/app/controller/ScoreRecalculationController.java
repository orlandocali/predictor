package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.RankingStats;
import com.app.dto.RecalculationResult;
import com.app.model.Ranking;
import com.app.service.RankingAggregationService;
import com.app.service.ScoreRecalculationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ScoreRecalculationController {

    private final ScoreRecalculationService scoreRecalculationService;
    private final RankingAggregationService rankingAggregationService;

    @PostMapping("/scores/recalculate/{matchId}")
    public ResponseEntity<ApiResponse<RecalculationResult>> recalculateMatch(@PathVariable String matchId) {
        log.info("Admin triggering score recalculation for match '{}'", matchId);
        RecalculationResult result = scoreRecalculationService.recalculateMatch(matchId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/scores/recalculate/all")
    public ResponseEntity<ApiResponse<RecalculationResult>> recalculateAll() {
        log.info("Admin triggering score recalculation for all scored matches");
        RecalculationResult result = scoreRecalculationService.recalculateAll();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/rankings")
    public ResponseEntity<ApiResponse<List<Ranking>>> getRankings() {
        log.info("Admin fetching leaderboard");
        List<Ranking> rankings = rankingAggregationService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }

    @GetMapping("/rankings/top/{n}")
    public ResponseEntity<ApiResponse<List<Ranking>>> getTopRankings(@PathVariable int n) {
        log.info("Admin fetching top {} users", n);
        List<Ranking> rankings = rankingAggregationService.getTopN(n);
        return ResponseEntity.ok(ApiResponse.success(rankings));
    }

    @GetMapping("/rankings/stats")
    public ResponseEntity<ApiResponse<RankingStats>> getRankingStats() {
        log.info("Admin fetching ranking stats");
        RankingStats stats = rankingAggregationService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
