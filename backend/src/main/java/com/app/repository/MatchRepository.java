package com.app.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.app.model.Match;

public interface MatchRepository extends MongoRepository<Match, String> {
}
