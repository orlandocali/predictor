package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.MatchResponse;
import com.app.dto.MatchResultRequest;
import com.app.service.ScoringEngine;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/admin/matches")
@PreAuthorize("hasRole('ADMIN')")
public class MatchResultController {

    private final ScoringEngine scoringEngine;

    public MatchResultController(ScoringEngine scoringEngine) {
        this.scoringEngine = scoringEngine;
    }

    @PostMapping("/{matchId}/result")
    public ResponseEntity<ApiResponse<MatchResponse>> submitResult(
            @PathVariable String matchId,
            @Valid @RequestBody MatchResultRequest request) {
        log.info("Admin submitting result for match '{}'", matchId);
        MatchResponse response = scoringEngine.submitResult(matchId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
