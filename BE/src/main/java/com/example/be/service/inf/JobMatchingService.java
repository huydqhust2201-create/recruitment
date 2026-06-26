package com.example.be.service.inf;

import com.example.be.dto.response.RecommendedJobsResponse;

import java.util.UUID;

public interface JobMatchingService {

    RecommendedJobsResponse getRecommendedJobs(UUID candidateUserId);
}
