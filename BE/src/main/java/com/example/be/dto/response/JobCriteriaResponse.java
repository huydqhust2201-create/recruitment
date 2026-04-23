package com.example.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class JobCriteriaResponse {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private int skillWeight;
    private int experienceWeight;
    private int educationWeight;
    private double passThreshold;
    private String customInstructions;
}
