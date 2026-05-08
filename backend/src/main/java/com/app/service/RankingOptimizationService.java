package com.app.service;

import com.app.dto.RankingAggregationRequest;
import com.app.dto.RankingResponse;
import com.app.dto.RankingStats;
import com.app.model.Ranking;
import com.app.repository.RankingRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.GroupOperation;
import org.springframework.data.mongodb.core.aggregation.LimitOperation;
import org.springframework.data.mongodb.core.aggregation.MatchOperation;
import org.springframework.data.mongodb.core.aggregation.SkipOperation;
import org.springframework.data.mongodb.core.aggregation.SortOperation;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Slf4j
@Service
@Validated
@RequiredArgsConstructor
public class RankingOptimizationService {

    private static final String RANKINGS_COLLECTION = "rankings";

    private final MongoTemplate mongoTemplate;
    private final RankingRepository rankingRepository;

    public Page<RankingResponse> getOptimizedLeaderboard(RankingAggregationRequest request) {
        log.info("Entering getOptimizedLeaderboard: request={} ", request);

        validateLeaderboardRequest(request);

        Criteria filterCriteria = buildFilterCriteria(request);
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());

        Query countQuery = new Query();
        if (filterCriteria != null) {
            countQuery.addCriteria(filterCriteria);
        }
        long totalCount = mongoTemplate.count(countQuery, Ranking.class);

        String primarySortField = mapSortField(request.getSortField());
        Sort.Direction direction = mapSortDirection(request.getDirection());
        Sort sort = buildSort(primarySortField, direction);

        List<AggregationOperation> operations = new ArrayList<>();
        if (filterCriteria != null) {
            MatchOperation matchOperation = Aggregation.match(filterCriteria);
            operations.add(matchOperation);
        }

        SortOperation sortOperation = Aggregation.sort(sort);
        SkipOperation skipOperation = Aggregation.skip((long) request.getPage() * request.getSize());
        LimitOperation limitOperation = Aggregation.limit(request.getSize());

        operations.add(sortOperation);
        operations.add(skipOperation);
        operations.add(limitOperation);

        Aggregation aggregation = Aggregation.newAggregation(operations);
        List<Ranking> rankings = mongoTemplate
                .aggregate(aggregation, RANKINGS_COLLECTION, Ranking.class)
                .getMappedResults();

        int basePosition = request.getPage() * request.getSize();
        List<RankingResponse> content = new ArrayList<>(rankings.size());
        for (int index = 0; index < rankings.size(); index++) {
            Ranking ranking = rankings.get(index);
            int position = basePosition + index + 1;
            content.add(toResponse(ranking, position));
        }

        Page<RankingResponse> page = new PageImpl<>(content, pageable, totalCount);
        log.info(
                "Exiting getOptimizedLeaderboard: page={}, size={}, returned={}, total={}",
                request.getPage(),
                request.getSize(),
                content.size(),
                totalCount);
        return page;
    }

    public RankingStats getAggregatedStats() {
        log.info("Entering getAggregatedStats");

        GroupOperation group = Aggregation.group()
                .count().as("totalUsers")
                .sum("totalPredictions").as("totalPredictions")
                .sum("totalPoints").as("totalPointsAwarded")
                .max("totalPoints").as("highestScore")
                .sum("exactScores").as("totalExactScores")
                .sum("correctOutcomes").as("totalCorrectOutcomes")
                .sum("incorrectPredictions").as("totalIncorrect");

        List<Document> results = mongoTemplate
                .aggregate(Aggregation.newAggregation(group), RANKINGS_COLLECTION, Document.class)
                .getMappedResults();

        if (results.isEmpty()) {
            RankingStats emptyStats = RankingStats.builder()
                    .totalUsers(0)
                    .totalPredictions(0)
                    .totalPointsAwarded(0)
                    .averagePointsPerUser(0.0)
                    .highestScore(0)
                    .totalExactScores(0)
                    .totalCorrectOutcomes(0)
                    .totalIncorrect(0)
                    .build();
            log.info("Exiting getAggregatedStats: no ranking documents, returning zeroed stats");
            return emptyStats;
        }

        Document document = results.get(0);

        int totalUsers = readInt(document, "totalUsers");
        int totalPredictions = readInt(document, "totalPredictions");
        int totalPointsAwarded = readInt(document, "totalPointsAwarded");
        int highestScore = readInt(document, "highestScore");
        int totalExactScores = readInt(document, "totalExactScores");
        int totalCorrectOutcomes = readInt(document, "totalCorrectOutcomes");
        int totalIncorrect = readInt(document, "totalIncorrect");

        double averagePointsPerUser = totalUsers == 0
                ? 0.0
                : Math.round(((double) totalPointsAwarded / totalUsers) * 100.0) / 100.0;

        RankingStats stats = RankingStats.builder()
                .totalUsers(totalUsers)
                .totalPredictions(totalPredictions)
                .totalPointsAwarded(totalPointsAwarded)
                .averagePointsPerUser(averagePointsPerUser)
                .highestScore(highestScore)
                .totalExactScores(totalExactScores)
                .totalCorrectOutcomes(totalCorrectOutcomes)
                .totalIncorrect(totalIncorrect)
                .build();

        log.info(
                "Exiting getAggregatedStats: totalUsers={}, totalPointsAwarded={}, highestScore={}",
                totalUsers,
                totalPointsAwarded,
                highestScore);
        return stats;
    }

    public int getUserPositionByPipeline(String userId) {
        log.info("Entering getUserPositionByPipeline: userId={}", userId);

        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId must not be null or blank");
        }

        Ranking userRanking = rankingRepository.findByUserId(userId).orElse(null);
        if (userRanking == null) {
            log.info("Exiting getUserPositionByPipeline: user not found, returning -1");
            return -1;
        }

        Criteria aboveCriteria = new Criteria().orOperator(
                Criteria.where("totalPoints").gt(userRanking.getTotalPoints()),
                new Criteria().andOperator(
                        Criteria.where("totalPoints").is(userRanking.getTotalPoints()),
                        Criteria.where("exactScores").gt(userRanking.getExactScores())));

        long above = mongoTemplate.count(Query.query(aboveCriteria), Ranking.class);
        int position = (int) above + 1;

        log.info("Exiting getUserPositionByPipeline: userId={}, position={}", userId, position);
        return position;
    }

    private void validateLeaderboardRequest(RankingAggregationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("request must not be null");
        }
        if (request.getPage() < 0) {
            throw new IllegalArgumentException("page must be >= 0");
        }
        if (request.getSize() < 1 || request.getSize() > 100) {
            throw new IllegalArgumentException("size must be between 1 and 100");
        }
    }

    private Criteria buildFilterCriteria(RankingAggregationRequest request) {
        Integer minPoints = request.getMinPoints();
        Integer maxPoints = request.getMaxPoints();
        String usernameContains = request.getUsernameContains();

        if (minPoints != null && maxPoints != null && minPoints > maxPoints) {
            throw new IllegalArgumentException("minPoints must be <= maxPoints");
        }

        List<Criteria> criteriaParts = new ArrayList<>();

        if (minPoints != null && maxPoints != null) {
            criteriaParts.add(Criteria.where("totalPoints").gte(minPoints).lte(maxPoints));
        } else if (minPoints != null) {
            criteriaParts.add(Criteria.where("totalPoints").gte(minPoints));
        } else if (maxPoints != null) {
            criteriaParts.add(Criteria.where("totalPoints").lte(maxPoints));
        }

        if (usernameContains != null && !usernameContains.isBlank()) {
            String escaped = Pattern.quote(usernameContains.trim());
            criteriaParts.add(Criteria.where("username").regex(escaped, "i"));
        }

        if (criteriaParts.isEmpty()) {
            return null;
        }
        if (criteriaParts.size() == 1) {
            return criteriaParts.get(0);
        }
        return new Criteria().andOperator(criteriaParts.toArray(new Criteria[0]));
    }

    private String mapSortField(RankingAggregationRequest.SortField sortField) {
        RankingAggregationRequest.SortField resolved =
                sortField != null ? sortField : RankingAggregationRequest.SortField.TOTAL_POINTS;

        return switch (resolved) {
            case TOTAL_POINTS -> "totalPoints";
            case EXACT_SCORES -> "exactScores";
            case CORRECT_OUTCOMES -> "correctOutcomes";
            case TOTAL_PREDICTIONS -> "totalPredictions";
        };
    }

    private Sort.Direction mapSortDirection(RankingAggregationRequest.SortDirection direction) {
        RankingAggregationRequest.SortDirection resolved =
                direction != null ? direction : RankingAggregationRequest.SortDirection.DESC;
        return resolved == RankingAggregationRequest.SortDirection.ASC
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
    }

    private Sort buildSort(String primarySortField, Sort.Direction primaryDirection) {
        Sort sort = Sort.by(primaryDirection, primarySortField);

        if (!"totalPoints".equals(primarySortField)) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "totalPoints"));
        }
        if (!"exactScores".equals(primarySortField)) {
            sort = sort.and(Sort.by(Sort.Direction.DESC, "exactScores"));
        }

        return sort;
    }

    private RankingResponse toResponse(Ranking ranking, int position) {
        return RankingResponse.builder()
                .position(position)
                .userId(ranking.getUserId())
                .username(ranking.getUsername())
                .totalPoints(ranking.getTotalPoints())
                .exactScores(ranking.getExactScores())
                .correctOutcomes(ranking.getCorrectOutcomes())
                .incorrectPredictions(ranking.getIncorrectPredictions())
                .totalPredictions(ranking.getTotalPredictions())
                .updatedAt(ranking.getUpdatedAt())
                .build();
    }

    private int readInt(Document document, String fieldName) {
        Object value = document.get(fieldName);
        if (value instanceof Number number) {
            return number.intValue();
        }
        return 0;
    }
}