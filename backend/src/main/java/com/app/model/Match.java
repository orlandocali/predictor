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
        @CompoundIndex(name = "kickoffAt_idx", def = "{'kickoffAt': 1}"),
        @CompoundIndex(name = "stage_idx", def = "{'stage': 1}"),
        @CompoundIndex(name = "status_idx", def = "{'status': 1}")
})
@Document(collection = "matches")
public class Match {

    @Id
    private String id;

    private String fifaMatchId;

    private String homeTeam;

    private String awayTeam;

    private MatchStage stage;

    private String groupName;

    private Instant kickoffAt;

    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    private String venue;

    private MatchResult result;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
