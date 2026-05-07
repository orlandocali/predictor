package com.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RemoteScoreDto {

    @JsonProperty("ft")
    private Integer[] ft;

    @JsonProperty("ht")
    private Integer[] ht;

    @JsonProperty("et")
    private Integer[] et;

    @JsonProperty("p")
    private Integer[] p;
}
