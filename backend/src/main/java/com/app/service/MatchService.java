package com.app.service;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.app.dto.CreateMatchRequest;
import com.app.dto.MatchResponse;
import com.app.exception.ResourceNotFoundException;
import com.app.mapper.MatchMapper;
import com.app.model.Match;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.repository.MatchRepository;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchMapper matchMapper;

    public MatchService(MatchRepository matchRepository, MatchMapper matchMapper) {
        this.matchRepository = matchRepository;
        this.matchMapper = matchMapper;
    }

    public MatchResponse createMatch(CreateMatchRequest request) {
        Match match = matchMapper.toEntity(request);
        return matchMapper.toResponse(matchRepository.save(match));
    }

    public MatchResponse getMatchById(String id) {
        return matchRepository.findById(id)
                .map(matchMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));
    }

    public List<MatchResponse> getAllMatches(MatchStage stage, MatchStatus status) {
        List<Match> matches;

        if (stage == null && status == null) {
            matches = matchRepository.findAll();
        } else if (stage != null && status == null) {
            matches = matchRepository.findByStage(stage);
        } else if (stage == null) {
            matches = matchRepository.findByStatus(status);
        } else {
            matches = matchRepository.findByStageAndStatus(stage, status);
        }

        return matches.stream()
                .map(matchMapper::toResponse)
                .toList();
    }

    public MatchResponse updateMatch(String id, CreateMatchRequest request) {
        Match existingMatch = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));

        existingMatch.setFifaMatchId(request.getFifaMatchId());
        existingMatch.setHomeTeam(request.getHomeTeam());
        existingMatch.setAwayTeam(request.getAwayTeam());
        existingMatch.setStage(request.getStage());
        existingMatch.setGroupName(request.getGroupName());
        existingMatch.setKickoffAt(Instant.parse(request.getKickoffAt()));
        if (request.getStatus() != null) {
            existingMatch.setStatus(request.getStatus());
        }
        existingMatch.setVenue(request.getVenue());
        if (request.getResult() != null) {
            existingMatch.setResult(request.getResult());
        }

        return matchMapper.toResponse(matchRepository.save(existingMatch));
    }

    public void deleteMatch(String id) {
        Match existingMatch = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));
        matchRepository.delete(existingMatch);
    }
}
