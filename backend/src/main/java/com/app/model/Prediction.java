package com.app.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndexes({
        @CompoundIndex(name = "userId_matchId_unique", def = "{'userId': 1, 'matchId': 1}", unique = true)
})
@Document(collection = "predictions")
public class Prediction {

    @Id
    private String id;

    private String userId;

    private String matchId;

    private Integer predictedHomeScore;

    private Integer predictedAwayScore;

    private String predictedPenaltyWinner;

    @Builder.Default
    private boolean locked = false;

    private Integer pointsEarned;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
