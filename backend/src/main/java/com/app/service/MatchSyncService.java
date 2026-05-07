package com.app.service;

import com.app.dto.RemoteMatchDto;
import com.app.dto.RemoteWorldCupDto;
import com.app.dto.SyncResultResponse;
import com.app.model.Match;
import com.app.model.MatchResult;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import com.app.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchSyncService {

    private final MatchRepository matchRepository;
    private final WebClient webClient;

    @Value("${app.sync.worldcup-url:https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json}")
    private String worldCupUrl;

    public SyncResultResponse syncMatches() {
        log.info("Starting match sync from {}", worldCupUrl);

        RemoteWorldCupDto remoteData = fetchRemoteData();

        List<RemoteMatchDto> remoteMatches = remoteData.getMatches();
        if (remoteMatches == null || remoteMatches.isEmpty()) {
            log.warn("No matches found in remote data");
            return SyncResultResponse.builder()
                    .total(0).created(0).updated(0).failed(0)
                    .errors(List.of())
                    .build();
        }

        int created = 0, updated = 0, failed = 0;
        List<String> errors = new ArrayList<>();

        for (RemoteMatchDto remote : remoteMatches) {
            try {
                boolean wasCreated = upsertMatch(remote);
                if (wasCreated) {
                    created++;
                } else {
                    updated++;
                }
            } catch (Exception e) {
                failed++;
                String err = String.format("Failed match num=%s (%s vs %s): %s",
                        remote.getNum(), remote.getTeam1(), remote.getTeam2(), e.getMessage());
                errors.add(err);
                log.error(err, e);
            }
        }

        log.info("Sync complete: total={} created={} updated={} failed={}",
                remoteMatches.size(), created, updated, failed);

        return SyncResultResponse.builder()
                .total(remoteMatches.size())
                .created(created)
                .updated(updated)
                .failed(failed)
                .errors(errors)
                .build();
    }

    private RemoteWorldCupDto fetchRemoteData() {
        try {
            return webClient.get()
                    .uri(worldCupUrl)
                    .retrieve()
                    .bodyToMono(RemoteWorldCupDto.class)
                    .block(Duration.ofSeconds(30));
        } catch (WebClientResponseException e) {
            log.error("HTTP error fetching remote data: status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to fetch remote match data: HTTP " + e.getStatusCode(), e);
        } catch (Exception e) {
            log.error("Network error fetching remote data", e);
            throw new RuntimeException("Failed to fetch remote match data: " + e.getMessage(), e);
        }
    }

    /**
     * Upsert a match. Returns true if created, false if updated.
     */
    private boolean upsertMatch(RemoteMatchDto remote) {
        String fifaMatchId = remote.getNum() != null ? String.valueOf(remote.getNum()) : null;

        Optional<Match> existing = Optional.empty();
        if (fifaMatchId != null) {
            existing = matchRepository.findByFifaMatchId(fifaMatchId);
        }

        Instant kickoffAt = parseKickoffAt(remote.getDate(), remote.getTime());
        MatchStage stage = parseStage(remote.getRound(), remote.getGroup());
        MatchResult result = parseResult(remote);

        if (existing.isPresent()) {
            Match match = existing.get();
            match.setHomeTeam(remote.getTeam1());
            match.setAwayTeam(remote.getTeam2());
            match.setKickoffAt(kickoffAt);
            match.setStage(stage);
            match.setGroupName(remote.getGroup());
            match.setVenue(remote.getGround());
            if (result != null) {
                match.setResult(result);
                if (match.getStatus() == MatchStatus.SCHEDULED || match.getStatus() == MatchStatus.LOCKED) {
                    match.setStatus(MatchStatus.FINISHED);
                }
            }
            matchRepository.save(match);
            log.debug("Updated match: {} vs {} (num={})", remote.getTeam1(), remote.getTeam2(), fifaMatchId);
            return false;
        } else {
            Match match = Match.builder()
                    .fifaMatchId(fifaMatchId)
                    .homeTeam(remote.getTeam1())
                    .awayTeam(remote.getTeam2())
                    .kickoffAt(kickoffAt)
                    .stage(stage)
                    .groupName(remote.getGroup())
                    .venue(remote.getGround())
                    .status(result != null ? MatchStatus.FINISHED : MatchStatus.SCHEDULED)
                    .result(result)
                    .build();
            matchRepository.save(match);
            log.debug("Created match: {} vs {} (num={})", remote.getTeam1(), remote.getTeam2(), fifaMatchId);
            return true;
        }
    }

    private Instant parseKickoffAt(String date, String time) {
        if (date == null) {
            throw new IllegalArgumentException("Match date is null");
        }
        String timeStr = (time != null && !time.isBlank()) ? time : "00:00";
        LocalDate localDate = LocalDate.parse(date);
        LocalTime localTime = LocalTime.parse(timeStr);
        return LocalDateTime.of(localDate, localTime).toInstant(ZoneOffset.UTC);
    }

    private MatchStage parseStage(String round, String group) {
        if (round == null) {
            return MatchStage.GROUP_STAGE;
        }
        String r = round.toLowerCase();
        if (group != null && !group.isBlank()) {
            return MatchStage.GROUP_STAGE;
        }
        if (r.contains("matchday")) {
            return MatchStage.GROUP_STAGE;
        }
        if (r.contains("round of 16") || r.contains("round of sixteen")) {
            return MatchStage.ROUND_OF_16;
        }
        if (r.contains("quarter")) {
            return MatchStage.QUARTER_FINAL;
        }
        if (r.contains("semi")) {
            return MatchStage.SEMI_FINAL;
        }
        if (r.contains("third") || r.contains("3rd") || r.contains("third-place") || r.contains("bronze")) {
            return MatchStage.THIRD_PLACE;
        }
        if (r.contains("final")) {
            return MatchStage.FINAL;
        }
        return MatchStage.GROUP_STAGE;
    }

    private MatchResult parseResult(RemoteMatchDto remote) {
        if (remote.getScore() == null) {
            return null;
        }
        Integer[] ft = remote.getScore().getFt();
        if (ft == null || ft.length < 2 || ft[0] == null || ft[1] == null) {
            return null;
        }

        int homeScore = ft[0];
        int awayScore = ft[1];
        String penaltyWinner = null;

        Integer[] penalties = remote.getScore().getP();
        if (penalties != null && penalties.length >= 2 && penalties[0] != null && penalties[1] != null) {
            penaltyWinner = penalties[0] > penalties[1] ? remote.getTeam1() : remote.getTeam2();
        }

        return MatchResult.builder()
                .homeScore(homeScore)
                .awayScore(awayScore)
                .penaltyWinner(penaltyWinner)
                .build();
    }
}
