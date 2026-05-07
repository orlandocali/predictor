package com.app.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.app.model.Match;
import com.app.model.MatchStage;
import com.app.model.MatchStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MatchRepository extends MongoRepository<Match, String> {

	List<Match> findByStage(MatchStage stage);

	List<Match> findByStatus(MatchStatus status);

	List<Match> findByStageAndStatus(MatchStage stage, MatchStatus status);

	List<Match> findByKickoffAtBefore(Instant time);

	Optional<Match> findByFifaMatchId(String fifaMatchId);
}
