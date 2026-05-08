package com.app.dto;

import com.app.model.MatchStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupedStageResponse {

    private MatchStage stage;

    private List<MatchResponse> matches;
}