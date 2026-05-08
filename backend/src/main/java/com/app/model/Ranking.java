package com.app.model;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rankings")
public class Ranking {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private String username;

    private int totalPoints;

    private int exactScores;

    private int correctOutcomes;

    private int incorrectPredictions;

    private int totalPredictions;

    @LastModifiedDate
    private Instant updatedAt;
}
