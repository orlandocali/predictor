package com.app.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KnockoutResultRequest {

    @NotNull(message = "homeScore is required")
    @Min(value = 0, message = "homeScore must be >= 0")
    private Integer homeScore;

    @NotNull(message = "awayScore is required")
    @Min(value = 0, message = "awayScore must be >= 0")
    private Integer awayScore;

    @Min(value = 0, message = "extraTimeHomeScore must be >= 0")
    private Integer extraTimeHomeScore;

    @Min(value = 0, message = "extraTimeAwayScore must be >= 0")
    private Integer extraTimeAwayScore;

    private String penaltyWinner;

    @NotBlank(message = "qualifyingTeam is required")
    private String qualifyingTeam;

    public boolean wentToExtraTime() {
        return extraTimeHomeScore != null && extraTimeAwayScore != null;
    }

    public boolean wentToPenalties() {
        return penaltyWinner != null && !penaltyWinner.isBlank();
    }
}