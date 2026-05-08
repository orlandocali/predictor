package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.GroupedStageResponse;
import com.app.dto.MatchResponse;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.service.MatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class UserMatchController {

    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getAllMatches(
            @RequestParam(required = false) MatchStage stage,
            @RequestParam(required = false) MatchStatus status,
            @RequestParam(required = false) String groupName) {
        log.debug("Public match list requested: stage={} status={} groupName={}", stage, status, groupName);
        return ResponseEntity.ok(ApiResponse.success(matchService.getAllMatches(stage, status, groupName)));
    }

    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<List<GroupedStageResponse>>> getGroupedMatches() {
        log.debug("Grouped match list requested");
        return ResponseEntity.ok(ApiResponse.success(matchService.getGroupedMatches()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> getMatchById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(matchService.getMatchById(id)));
    }
}