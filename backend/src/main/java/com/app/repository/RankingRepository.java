package com.app.repository;

import com.app.model.Ranking;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RankingRepository extends MongoRepository<Ranking, String> {

    Optional<Ranking> findByUserId(String userId);

    List<Ranking> findAllByOrderByTotalPointsDescExactScoresDesc();
}
