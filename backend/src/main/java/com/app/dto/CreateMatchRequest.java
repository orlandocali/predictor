package com.app.dto;

import com.app.model.MatchResult;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMatchRequest {

    @NotBlank
    private String homeTeam;

    @NotBlank
    private String awayTeam;

    @NotNull
    private MatchStage stage;

    private String groupName;

    @NotBlank
    private String kickoffAt;

    private MatchStatus status;

    private String venue;

    private String fifaMatchId;

    private MatchResult result;
}