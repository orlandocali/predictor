package com.app.controller;

import com.app.dto.ApiResponse;
import com.app.dto.SyncResultResponse;
import com.app.service.MatchSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/matches")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class SyncMatchController {

    private final MatchSyncService matchSyncService;

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<SyncResultResponse>> syncMatches() {
        log.info("Admin triggered match sync");
        SyncResultResponse result = matchSyncService.syncMatches();
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
