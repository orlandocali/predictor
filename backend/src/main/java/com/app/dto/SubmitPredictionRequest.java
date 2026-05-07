package com.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitPredictionRequest {

    @NotBlank
    private String matchId;

    @NotNull
    @Min(0)
    private Integer predictedHomeScore;

    @NotNull
    @Min(0)
    private Integer predictedAwayScore;

    private String predictedPenaltyWinner;
}
