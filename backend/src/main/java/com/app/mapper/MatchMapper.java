package com.app.mapper;

import java.time.Instant;

import org.springframework.stereotype.Component;

import com.app.dto.CreateMatchRequest;
import com.app.dto.MatchResponse;
import com.app.model.Match;
import com.app.model.MatchStatus;

@Component
public class MatchMapper {

    public MatchResponse toResponse(Match match) {
        if (match == null) {
            return null;
        }

        return MatchResponse.builder()
                .id(match.getId())
                .fifaMatchId(match.getFifaMatchId())
                .homeTeam(match.getHomeTeam())
                .awayTeam(match.getAwayTeam())
                .stage(match.getStage())
            .group(match.getGroupName())
                .kickoffAt(match.getKickoffAt())
                .status(match.getStatus())
                .venue(match.getVenue())
                .result(match.getResult())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .build();
    }

    public Match toEntity(CreateMatchRequest request) {
        return Match.builder()
                .fifaMatchId(request.getFifaMatchId())
                .homeTeam(request.getHomeTeam())
                .awayTeam(request.getAwayTeam())
                .stage(request.getStage())
                .groupName(request.getGroupName())
                .kickoffAt(Instant.parse(request.getKickoffAt()))
                .status(request.getStatus() == null ? MatchStatus.SCHEDULED : request.getStatus())
                .venue(request.getVenue())
                .result(request.getResult())
                .build();
    }
}
