package com.app.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingAggregationRequest {

    @Min(0)
    @Builder.Default
    private int page = 0;

    @Min(1)
    @Max(100)
    @Builder.Default
    private int size = 20;

    @Min(0)
    private Integer minPoints;

    @Min(0)
    private Integer maxPoints;

    private String usernameContains;

    @NotNull
    @Builder.Default
    private SortField sortField = SortField.TOTAL_POINTS;

    @NotNull
    @Builder.Default
    private SortDirection direction = SortDirection.DESC;

    public static enum SortField {
        TOTAL_POINTS,
        EXACT_SCORES,
        CORRECT_OUTCOMES,
        TOTAL_PREDICTIONS
    }

    public static enum SortDirection {
        ASC,
        DESC
    }
}
