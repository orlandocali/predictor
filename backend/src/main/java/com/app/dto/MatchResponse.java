package com.app.dto;

import java.time.Instant;

import com.app.model.MatchResult;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {

    private String id;

    private String fifaMatchId;

    private String homeTeam;

    private String awayTeam;

    private MatchStage stage;

    private String group;

    private Instant kickoffAt;

    private MatchStatus status;

    private String venue;

    private MatchResult result;

    private Instant createdAt;

    private Instant updatedAt;
}