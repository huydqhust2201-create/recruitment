package com.example.be.service.inf;

import com.example.be.dto.request.JobCriteriaRequest;
import com.example.be.dto.response.JobCriteriaResponse;

import java.util.UUID;

public interface JobCriteriaService {
    JobCriteriaResponse createOrUpdate(UUID id, JobCriteriaRequest request,UUID recruiterID );
    JobCriteriaResponse getByJobId(UUID jobId);

}

