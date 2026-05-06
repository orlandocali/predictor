package com.app.mapper;

import org.springframework.stereotype.Component;

import com.app.dto.MatchDTO;
import com.app.model.Match;

@Component
public class MatchMapper {

    public MatchDTO toDTO(Match match) {
        if (match == null) {
            return null;
        }

        return MatchDTO.builder()
                .id(match.getId())
                .homeTeam(match.getHomeTeam())
                .awayTeam(match.getAwayTeam())
                .matchDate(match.getMatchDate())
                .status(match.getStatus())
                .build();
    }
}
