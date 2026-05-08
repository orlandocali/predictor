package com.app.controller;

import java.util.List;

import com.app.dto.ApiResponse;
import com.app.dto.PredictionRequest;
import com.app.dto.PredictionResponse;
import com.app.dto.UpdatePredictionRequest;
import com.app.exception.ResourceNotFoundException;
import com.app.repository.UserRepository;
import com.app.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<PredictionResponse>> submitPrediction(
            @Valid @RequestBody PredictionRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String username = principal.getUsername();
        String userId = resolveUserId(username);

        log.debug("User '{}' submitting prediction for match '{}'", username, request.getMatchId());

        PredictionResponse response = predictionService.submitPrediction(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PredictionResponse>>> getMyPredictions(
            @AuthenticationPrincipal UserDetails principal) {
        String username = principal.getUsername();
        String userId = resolveUserId(username);

        log.debug("User '{}' requesting all predictions", username);

        List<PredictionResponse> response = predictionService.getPredictionsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/match/{matchId}")
    public ResponseEntity<ApiResponse<PredictionResponse>> getMyPredictionForMatch(
            @PathVariable String matchId,
            @AuthenticationPrincipal UserDetails principal) {
        String username = principal.getUsername();
        String userId = resolveUserId(username);

        log.debug("User '{}' requesting prediction for match '{}'", username, matchId);

        PredictionResponse response = predictionService.getPredictionByUserAndMatch(userId, matchId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PredictionResponse>> updatePrediction(
            @PathVariable String id,
            @Valid @RequestBody UpdatePredictionRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        String userId = resolveUserId(principal.getUsername());
        log.debug("User '{}' updating prediction '{}'", principal.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success(predictionService.updatePrediction(userId, id, request)));
    }

    private String resolveUserId(String username) {
        return userRepository.findByUsername(username)
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}