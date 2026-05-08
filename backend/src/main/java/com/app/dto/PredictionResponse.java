package com.app.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PredictionResponse {

    private String id;

    private String userId;

    private String matchId;

    private Integer predictedHomeScore;

    private Integer predictedAwayScore;

    private String predictedPenaltyWinner;

    private boolean locked;

    private Integer pointsEarned;

    private Instant createdAt;

    private Instant updatedAt;
}
