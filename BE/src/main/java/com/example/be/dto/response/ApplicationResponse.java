package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class ApplicationResponse {

    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String companyName;
    private UUID candidateId;
    private String candidateFullName;
    private String candidateEmail;
    private UUID cvFileId;
    private String cvFileUrl;
    private String coverLetter;
    private String candidateHeadline;
    private String candidateCurrentPosition;
    private Integer candidateYearsExp;
    private String candidateCity;
    private String status;
    private Double aiMatchScore;
    private Boolean passedThreshold;
    private Double skillScore;
    private Double experienceScore;
    private Double educationScore;
    private OffsetDateTime appliedAt;
    private OffsetDateTime updatedAt;
}
