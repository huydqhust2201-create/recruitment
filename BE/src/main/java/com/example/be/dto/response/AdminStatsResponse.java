package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalCandidates;
    private long totalRecruiters;
    private long totalCompanies;
    private long totalJobs;
    private long activeJobs;
    private long totalApplications;
    private long activeSubscriptions;
}
