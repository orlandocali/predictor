package com.app.repository;

import java.util.List;
import java.util.Optional;

import com.app.model.Prediction;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PredictionRepository extends MongoRepository<Prediction, String> {

	Optional<Prediction> findByUserIdAndMatchId(String userId, String matchId);

	List<Prediction> findByUserId(String userId);

	List<Prediction> findByMatchId(String matchId);

	boolean existsByUserIdAndMatchId(String userId, String matchId);
}
