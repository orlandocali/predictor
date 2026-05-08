package com.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResultRequest {

    @NotNull(message = "homeScore is required")
    @Min(value = 0, message = "homeScore must be >= 0")
    private Integer homeScore;

    @NotNull(message = "awayScore is required")
    @Min(value = 0, message = "awayScore must be >= 0")
    private Integer awayScore;

    private String penaltyWinner;

    @Min(value = 0, message = "extraTimeHomeScore must be >= 0")
    private Integer extraTimeHomeScore;

    @Min(value = 0, message = "extraTimeAwayScore must be >= 0")
    private Integer extraTimeAwayScore;
}
