package com.app.service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.app.dto.CreateMatchRequest;
import com.app.dto.GroupedStageResponse;
import com.app.dto.MatchResponse;
import com.app.exception.ResourceNotFoundException;
import com.app.mapper.MatchMapper;
import com.app.model.Match;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.repository.MatchRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final MatchMapper matchMapper;

    public MatchService(MatchRepository matchRepository, MatchMapper matchMapper) {
        this.matchRepository = matchRepository;
        this.matchMapper = matchMapper;
    }

    public MatchResponse createMatch(CreateMatchRequest request) {
        log.info("Creating match: {} vs {}", request.getHomeTeam(), request.getAwayTeam());
        Match match = matchMapper.toEntity(request);
        Match saved = matchRepository.save(match);
        log.info("Match created with id '{}'", saved.getId());
        return matchMapper.toResponse(saved);
    }

    public MatchResponse getMatchById(String id) {
        log.debug("Fetching match id '{}'", id);
        return matchRepository.findById(id)
                .map(matchMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));
    }

    public List<MatchResponse> getAllMatches(MatchStage stage, MatchStatus status, String groupName) {
        log.debug("Fetching matches stage={} status={} groupName={}", stage, status, groupName);
        List<Match> matches;

        if (groupName != null) {
            matches = status != null
                    ? matchRepository.findByGroupNameAndStatus(groupName, status)
                    : matchRepository.findByGroupName(groupName);
        } else if (stage == null && status == null) {
            matches = matchRepository.findAll();
        } else if (stage != null && status == null) {
            matches = matchRepository.findByStage(stage);
        } else if (stage == null) {
            matches = matchRepository.findByStatus(status);
        } else {
            matches = matchRepository.findByStageAndStatus(stage, status);
        }

        log.debug("Found {} matches (stage={}, status={}, groupName={})", matches.size(), stage, status, groupName);
        return matches.stream()
                .map(matchMapper::toResponse)
                .toList();
    }

        public List<GroupedStageResponse> getGroupedMatches() {
        log.debug("Fetching all matches grouped by stage");
        List<Match> all = matchRepository.findAll();
        log.debug("Grouping {} matches by stage", all.size());

        return all.stream()
            .sorted(Comparator.comparing(Match::getKickoffAt))
            .collect(Collectors.groupingBy(Match::getStage))
            .entrySet().stream()
            .sorted(Comparator.comparingInt(e -> e.getKey().ordinal()))
            .map(entry -> GroupedStageResponse.builder()
                .stage(entry.getKey())
                .matches(entry.getValue().stream()
                    .map(matchMapper::toResponse)
                    .toList())
                .build())
            .toList();
        }

    public MatchResponse updateMatch(String id, CreateMatchRequest request) {
        log.info("Updating match id '{}'", id);
        Match existingMatch = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));

        existingMatch.setExternalMatchId(request.getExternalMatchId());
        existingMatch.setHomeTeam(request.getHomeTeam());
        existingMatch.setAwayTeam(request.getAwayTeam());
        existingMatch.setStage(request.getStage());
        existingMatch.setGroupName(request.getGroupName());
        existingMatch.setKickoffAt(Instant.parse(request.getKickoffAt()));
        if (request.getStatus() != null) {
            if (request.getStatus() != existingMatch.getStatus()) {
                log.info("Match '{}' status changed: {} -> {}", id, existingMatch.getStatus(), request.getStatus());
            }
            existingMatch.setStatus(request.getStatus());
        }
        existingMatch.setVenue(request.getVenue());
        if (request.getResult() != null) {
            existingMatch.setResult(request.getResult());
            log.info("Match '{}' result set: {}-{}{}", id,
                    request.getResult().getHomeScore(),
                    request.getResult().getAwayScore(),
                    request.getResult().getPenaltyWinner() != null
                            ? " (pen: " + request.getResult().getPenaltyWinner() + ")" : "");
        }

        log.info("Match '{}' updated: {} vs {} at {}", id, existingMatch.getHomeTeam(), existingMatch.getAwayTeam(), existingMatch.getKickoffAt());
        return matchMapper.toResponse(matchRepository.save(existingMatch));
    }

    public MatchResponse updateMatchStatus(String id, MatchStatus newStatus) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));

        validateStatusTransition(match.getStatus(), newStatus);

        log.info("Match '{}' status transition: {} -> {}", id, match.getStatus(), newStatus);
        match.setStatus(newStatus);
        return matchMapper.toResponse(matchRepository.save(match));
    }

    private void validateStatusTransition(MatchStatus current, MatchStatus next) {
        boolean valid = switch (current) {
            case SCHEDULED -> next == MatchStatus.LOCKED;
            case LOCKED    -> next == MatchStatus.FINISHED;
            case FINISHED  -> next == MatchStatus.SCORED;
            case SCORED    -> false;
        };
        if (!valid) {
            throw new IllegalArgumentException(
                    "Invalid status transition: " + current + " -> " + next);
        }
    }

    public void deleteMatch(String id) {
        log.info("Deleting match id '{}'", id);
        Match existingMatch = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + id));
        log.info("Deleting match '{}': {} vs {}", id, existingMatch.getHomeTeam(), existingMatch.getAwayTeam());
        matchRepository.delete(existingMatch);
    }
}
