package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class AiScoreResponse {

    private UUID id;
    private UUID applicationId;
    private Double vectorScore;
    private Double llmScore;
    private Double skillScore;
    private Double experienceScore;
    private Double educationScore;
    private Double finalScore;
    private String strengths;
    private String weaknesses;
    private String recommendation;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> improvementSuggestions;
    private String aiModelUsed;
    private Integer tokensUsed;
    private OffsetDateTime scoredAt;
}
