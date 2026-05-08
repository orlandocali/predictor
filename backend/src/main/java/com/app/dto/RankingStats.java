package com.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingStats {

    private int totalUsers;
    private int totalPredictions;
    private int totalPointsAwarded;
    private double averagePointsPerUser;
    private int highestScore;
    private int totalExactScores;
    private int totalCorrectOutcomes;
    private int totalIncorrect;
}
