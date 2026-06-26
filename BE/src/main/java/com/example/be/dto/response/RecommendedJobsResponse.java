package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RecommendedJobsResponse {

    private boolean hasCvEmbedding;
    private List<JobResponse> jobs;
}
