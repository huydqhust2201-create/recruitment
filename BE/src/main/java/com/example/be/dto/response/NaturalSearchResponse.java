package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NaturalSearchResponse {
    private String keyword;
    private String city;
    private String level;
    private String industry;
    private Long minSalary;
    private Long maxSalary;
    private String summary;
}
