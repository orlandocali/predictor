package com.app.controller;

import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.ApiResponse;
import com.app.dto.CreateMatchRequest;
import com.app.dto.MatchResponse;
import com.app.dto.UpdateMatchStatusRequest;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.service.MatchService;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/matches")
@PreAuthorize("hasRole('ADMIN')")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping("/")
    public ResponseEntity<ApiResponse<MatchResponse>> createMatch(@Valid @RequestBody CreateMatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(matchService.createMatch(request)));
    }

    @GetMapping("/")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> getAllMatches(
            @RequestParam(required = false) MatchStage stage,
            @RequestParam(required = false) MatchStatus status,
            @RequestParam(required = false) String groupName) {
        return ResponseEntity.ok(ApiResponse.success(matchService.getAllMatches(stage, status, groupName)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> getMatchById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(matchService.getMatchById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatch(@PathVariable String id,
            @Valid @RequestBody CreateMatchRequest request) {
        return ResponseEntity.ok(ApiResponse.success(matchService.updateMatch(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<MatchResponse>> updateMatchStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateMatchStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(matchService.updateMatchStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMatch(@PathVariable String id,
            @AuthenticationPrincipal UserDetails principal) {
        log.info("Admin '{}' requested deletion of match '{}'", principal.getUsername(), id);
        matchService.deleteMatch(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
