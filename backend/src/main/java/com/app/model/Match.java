package com.app.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "matches")
public class Match {

    @Id
    private String id;
    private String homeTeam;
    private String awayTeam;
    private LocalDateTime matchDate;
    private String status;
}
