package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.RankingResponse;
import com.app.dto.RankingStats;
import com.app.repository.UserRepository;
import com.app.service.RankingAggregationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/rankings")
@RequiredArgsConstructor
@Tag(name = "Rankings", description = "Public leaderboard endpoints")
public class RankingController {

    private final RankingAggregationService rankingAggregationService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get paginated leaderboard")
    public ResponseEntity<ApiResponse<Page<RankingResponse>>> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "page must be >= 0");
        }
        if (size < 1 || size > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "size must be between 1 and 100");
        }

        Page<RankingResponse> leaderboard = rankingAggregationService.getLeaderboardPage(page, size);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }

    @GetMapping("/top/{n}")
    @Operation(summary = "Get top N leaderboard")
    public ResponseEntity<ApiResponse<List<RankingResponse>>> getTopN(@PathVariable int n) {
        if (n < 1 || n > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "n must be between 1 and 100");
        }

        List<RankingResponse> topRankings = rankingAggregationService.getTopNResponse(n);
        return ResponseEntity.ok(ApiResponse.success(topRankings));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user's ranking")
    public ResponseEntity<ApiResponse<RankingResponse>> getMyRanking() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByUsername(username)
                .map(user -> {
                    ApiResponse<RankingResponse> response = ApiResponse.success(
                            rankingAggregationService.getUserRankResponse(user.getId()).orElse(null));
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    @Operation(summary = "Get leaderboard aggregate stats")
    public ResponseEntity<ApiResponse<RankingStats>> getLeaderboardStats() {
        RankingStats stats = rankingAggregationService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
