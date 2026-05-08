package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.RankingAggregationRequest;
import com.app.dto.RankingResponse;
import com.app.dto.RankingStats;
import com.app.repository.UserRepository;
import com.app.service.RankingOptimizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rankings/optimized")
@RequiredArgsConstructor
@Tag(name = "Rankings Optimization", description = "MongoDB aggregation-backed leaderboard endpoints")
public class RankingOptimizationController {

    private final RankingOptimizationService rankingOptimizationService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Aggregation-backed paginated leaderboard with optional filters and sorting")
    public ResponseEntity<ApiResponse<Page<RankingResponse>>> getOptimizedLeaderboard(
            @Valid @RequestBody RankingAggregationRequest request) {
        try {
            Page<RankingResponse> leaderboard = rankingOptimizationService.getOptimizedLeaderboard(request);
            return ResponseEntity.ok(ApiResponse.success(leaderboard));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @Operation(summary = "MongoDB pipeline-computed aggregate leaderboard stats")
    public ResponseEntity<ApiResponse<RankingStats>> getAggregatedStats() {
        RankingStats stats = rankingOptimizationService.getAggregatedStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/position/me")
    @Operation(summary = "Current user's rank position computed via aggregation pipeline")
    public ResponseEntity<ApiResponse<Integer>> getMyPosition() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        return userRepository.findByUsername(username)
                .map(user -> {
                    int position = rankingOptimizationService.getUserPositionByPipeline(user.getId());
                    return ResponseEntity.ok(ApiResponse.success(position));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/position/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: get any user's rank position by userId via aggregation pipeline")
    public ResponseEntity<ApiResponse<Integer>> getUserPosition(@PathVariable String userId) {
        try {
            int position = rankingOptimizationService.getUserPositionByPipeline(userId);
            return ResponseEntity.ok(ApiResponse.success(position));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
