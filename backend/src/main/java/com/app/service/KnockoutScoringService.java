package com.app.service;

import com.app.dto.KnockoutResultRequest;
import com.app.dto.MatchResponse;
import com.app.exception.ResourceNotFoundException;
import com.app.mapper.MatchMapper;
import com.app.model.Match;
import com.app.model.MatchResult;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.repository.MatchRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class KnockoutScoringService {

    private final MatchRepository matchRepository;
    private final MatchService matchService;
    private final MatchMapper matchMapper;
    private final ScoringEngine scoringEngine;

    public KnockoutScoringService(MatchRepository matchRepository,
                                  MatchService matchService,
                                  MatchMapper matchMapper,
                                  ScoringEngine scoringEngine) {
        this.matchRepository = matchRepository;
        this.matchService = matchService;
        this.matchMapper = matchMapper;
        this.scoringEngine = scoringEngine;
    }

    public MatchResponse submitKnockoutResult(String matchId, KnockoutResultRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found: " + matchId));

        if (match.getStage() == MatchStage.GROUP_STAGE) {
            throw new IllegalArgumentException(
                    "Match '" + matchId + "' is not a knockout match (stage: " + match.getStage() + ")");
        }

        if (match.getStatus() != MatchStatus.FINISHED) {
            throw new IllegalArgumentException(
                    "Match must be in FINISHED status to submit result, current: " + match.getStatus());
        }

        if (!teamMatches(request.getQualifyingTeam(), match.getHomeTeam())
                && !teamMatches(request.getQualifyingTeam(), match.getAwayTeam())) {
            throw new IllegalArgumentException("qualifyingTeam must be one of the competing teams");
        }

        if (request.getHomeScore().equals(request.getAwayScore()) && !request.wentToPenalties()) {
            throw new IllegalArgumentException("penaltyWinner is required for a drawn knockout match");
        }

        if (request.wentToPenalties() && !teamMatches(request.getPenaltyWinner(), request.getQualifyingTeam())) {
            throw new IllegalArgumentException("penaltyWinner must match qualifyingTeam");
        }

        boolean hasExtraTimeHome = request.getExtraTimeHomeScore() != null;
        boolean hasExtraTimeAway = request.getExtraTimeAwayScore() != null;
        if (hasExtraTimeHome != hasExtraTimeAway) {
            throw new IllegalArgumentException(
                    "extraTimeHomeScore and extraTimeAwayScore must both be provided together");
        }
        if (request.wentToExtraTime() && (!hasExtraTimeHome || !hasExtraTimeAway)) {
            throw new IllegalArgumentException(
                    "extraTimeHomeScore and extraTimeAwayScore must both be provided together");
        }

        MatchResult result = MatchResult.builder()
                .homeScore(request.getHomeScore())
                .awayScore(request.getAwayScore())
                .extraTimeHomeScore(request.getExtraTimeHomeScore())
                .extraTimeAwayScore(request.getExtraTimeAwayScore())
                .penaltyWinner(request.getPenaltyWinner())
                .qualifyingTeam(request.getQualifyingTeam())
                .wentToExtraTime(request.wentToExtraTime())
                .wentToPenalties(request.wentToPenalties())
                .build();

        match.setResult(result);
        matchRepository.save(match);
        log.info("Knockout result saved for match '{}': {}-{}, qualifier: {}{}{}",
                matchId,
                result.getHomeScore(),
                result.getAwayScore(),
                result.getQualifyingTeam(),
                result.isWentToExtraTime() ? " (ET)" : "",
                result.isWentToPenalties() ? " (pen: " + result.getPenaltyWinner() + ")" : "");

        scoringEngine.scoreMatchFromSavedResult(matchId);

        Match scored = matchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found after scoring: " + matchId));
        return matchMapper.toResponse(scored);
    }

    public List<String> getQualifyingTeams(MatchStage stage) {
        log.info("Fetching qualifying teams for stage '{}'", stage);
        return matchRepository.findByStageAndStatus(stage, MatchStatus.SCORED).stream()
                .map(Match::getResult)
                .filter(result -> result != null && result.getQualifyingTeam() != null)
                .map(MatchResult::getQualifyingTeam)
                .toList();
    }

    public Map<MatchStage, List<String>> getAllKnockoutQualifications() {
        log.info("Fetching knockout qualifications for all stages");

        Map<MatchStage, List<String>> qualifications = new LinkedHashMap<>();
        List<MatchStage> knockoutStages = List.of(
                MatchStage.ROUND_OF_16,
                MatchStage.QUARTER_FINAL,
                MatchStage.SEMI_FINAL,
                MatchStage.THIRD_PLACE,
                MatchStage.FINAL
        );

        for (MatchStage stage : knockoutStages) {
            List<String> qualifyingTeams = getQualifyingTeams(stage);
            if (!qualifyingTeams.isEmpty()) {
                qualifications.put(stage, qualifyingTeams);
            }
        }

        return qualifications;
    }

    private boolean teamMatches(String left, String right) {
        return left != null && right != null && left.trim().equalsIgnoreCase(right.trim());
    }
}