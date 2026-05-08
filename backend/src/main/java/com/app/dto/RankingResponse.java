package com.app.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RankingResponse {

    // 1-indexed rank position computed dynamically.
    private int position;
    private String userId;
    private String username;
    private int totalPoints;
    private int exactScores;
    private int correctOutcomes;
    private int incorrectPredictions;
    private int totalPredictions;
    private Instant updatedAt;
}
