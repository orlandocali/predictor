package com.app.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResult {

    private int homeScore;

    private int awayScore;

    private String penaltyWinner;

    private Integer extraTimeHomeScore;

    private Integer extraTimeAwayScore;

    private String qualifyingTeam;

    private boolean wentToExtraTime;

    private boolean wentToPenalties;
}