package com.app.service;

import java.time.Instant;
import java.util.List;

import com.app.model.Match;
import com.app.model.MatchStatus;
import com.app.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MatchLockScheduler {

    private final MatchRepository matchRepository;

    // Runs every minute. Locks any SCHEDULED match whose kickoff is within 12 hours.
    @Scheduled(fixedRate = 60_000)
    public void lockMatchesApproachingKickoff() {
        Instant lockThreshold = Instant.now().plusSeconds(12 * 60 * 60);

        List<Match> toLock = matchRepository.findByStatus(MatchStatus.SCHEDULED).stream()
                .filter(m -> m.getKickoffAt().isBefore(lockThreshold))
                .toList();

        if (toLock.isEmpty()) return;

        toLock.forEach(m -> m.setStatus(MatchStatus.LOCKED));
        matchRepository.saveAll(toLock);

        log.info("Auto-locked {} match(es) within 12h of kickoff", toLock.size());
    }
}
