package com.app.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScoringResult {

    private String matchId;

    private String userId;

    private Integer predictedHomeScore;

    private Integer predictedAwayScore;

    private Integer actualHomeScore;

    private Integer actualAwayScore;

    private String predictedPenaltyWinner;

    private String actualPenaltyWinner;

    private int pointsEarned;

    private PointsBreakdown breakdown;

    public enum PointsBreakdown {
        EXACT_SCORE,
        CORRECT_OUTCOME,
        INCORRECT
    }
}
