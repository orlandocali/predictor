package com.app.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchDTO {

    private String id;
    private String homeTeam;
    private String awayTeam;
    private LocalDateTime matchDate;
    private String status;
}
