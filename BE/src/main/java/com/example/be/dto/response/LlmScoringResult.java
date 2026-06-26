package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class LlmScoringResult {
    private double skillScore;
    private double experienceScore;
    private double educationScore;
    private String strengths;
    private String weaknesses;
    private String recommendation;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> improvementSuggestions;
    private int tokensUsed;
    private String modelUsed;
}
