package com.app.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.time.DateTimeException;
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
    private final ObjectMapper objectMapper;

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
        String body;
        try {
            body = webClient.get()
                    .uri(worldCupUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(30));
        } catch (WebClientResponseException e) {
            log.error("HTTP error fetching remote data: status={}", e.getStatusCode());
            throw new RuntimeException("Failed to fetch remote match data: HTTP " + e.getStatusCode(), e);
        } catch (Exception e) {
            log.error("Network error fetching remote data: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch remote match data: " + e.getMessage(), e);
        }

        if (body == null || body.isBlank()) {
            throw new RuntimeException("Remote data source returned an empty response");
        }

        try {
            return objectMapper.readValue(body, RemoteWorldCupDto.class);
        } catch (Exception e) {
            log.error("Failed to parse remote match data: {}", e.getMessage());
            throw new RuntimeException("Failed to parse remote match data: " + e.getMessage(), e);
        }
    }

    /**
     * Upsert a match. Returns true if created, false if updated.
     */
    private boolean upsertMatch(RemoteMatchDto remote) {
        // Prefer numeric match number; fall back to composite key for group-stage matches without a num
        String fifaMatchId = remote.getNum() != null
                ? String.valueOf(remote.getNum())
                : remote.getTeam1() + "|" + remote.getTeam2() + "|" + remote.getDate();

        Optional<Match> existing = matchRepository.findByFifaMatchId(fifaMatchId);

        Instant kickoffAt = parseKickoffAt(remote.getDate(), remote.getTime());
        MatchStage stage = parseStage(remote.getRound(), remote.getGroup());
        MatchResult result = parseResult(remote);

        String groupName = normalizeGroupName(remote.getGroup());

        if (existing.isPresent()) {
            Match match = existing.get();
            match.setHomeTeam(remote.getTeam1());
            match.setAwayTeam(remote.getTeam2());
            match.setKickoffAt(kickoffAt);
            match.setStage(stage);
            match.setGroupName(groupName);
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
                    .groupName(groupName)
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

        String rawTime = (time != null && !time.isBlank()) ? time.trim() : "00:00";
        ZoneOffset offset = ZoneOffset.UTC;

        // Handle formats like "13:00 UTC-6", "20:00 UTC+5:30", "12:00 UTC-4"
        if (rawTime.contains(" ")) {
            String[] parts = rawTime.split(" ", 2);
            rawTime = parts[0]; // e.g. "13:00"
            String tzPart = parts[1]; // e.g. "UTC-6"
            if (tzPart.startsWith("UTC")) {
                String offsetStr = tzPart.substring(3); // e.g. "-6", "+5:30"
                if (!offsetStr.isEmpty()) {
                    try {
                        offset = ZoneOffset.of(offsetStr);
                    } catch (DateTimeException e) {
                        // Try parsing as plain integer hours (e.g. "-6" -> ZoneOffset.ofHours(-6))
                        try {
                            offset = ZoneOffset.ofHours(Integer.parseInt(offsetStr));
                        } catch (NumberFormatException nfe) {
                            log.warn("Unrecognised UTC offset '{}', defaulting to UTC", tzPart);
                        }
                    }
                }
            }
        }

        LocalDate localDate = LocalDate.parse(date);
        LocalTime localTime = LocalTime.parse(rawTime);
        return LocalDateTime.of(localDate, localTime).toInstant(offset);
    }

    // Strips "Group " prefix from remote group values (e.g. "Group A" → "A").
    private String normalizeGroupName(String group) {
        if (group == null || group.isBlank()) return null;
        return group.replaceFirst("(?i)^group\\s+", "").trim();
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
