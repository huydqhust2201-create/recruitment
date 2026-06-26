package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CandidateSearchResult {
    private String id;
    private String fullName;
    private String email;
    private String headline;
    private String currentPosition;
    private String currentCompany;
    private Integer yearsOfExperience;
    private String city;
    private List<String> skills;
    private String cvFileUrl;
    private Double matchScore;      // 0.0 – 1.0
}
