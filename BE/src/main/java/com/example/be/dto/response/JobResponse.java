package com.example.be.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class JobResponse {
    private UUID id;
    private String title;
    private String slug;
    private String description;
    private String requirements;
    private String benefits;
    private String jobType;
    private String level;
    private String industry;
    private String city;
    private Long salaryMin;
    private Long salaryMax;
    @JsonProperty("isSalaryPublic")
    private boolean isSalaryPublic;
    private String status;
    private int viewCount;
    private int applyCount;
    private LocalDate deadline;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;

    // ThÃ´ng tin cÃ´ng ty
    private UUID companyId;
    private String companyName;
    private String companyLogo;

    // Danh sÃ¡ch skill
    private List<SkillInfo> skills;

    // AI job matching (optional)
    private Double similarityScore;

    @Data
    @Builder
    public static class SkillInfo {
        private UUID skillId;
        private String skillName;
        private boolean isRequired;
        private String level;
    }
}
