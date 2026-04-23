package com.example.be.service.inf;

import com.example.be.dto.request.JobRequest;
import com.example.be.dto.response.JobResponse;
import com.example.be.entity.enums.JobLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface JobService  {
    JobResponse create(JobRequest request, UUID recruitmentID);
    JobResponse getById(UUID id);
    JobResponse getBySlug(String slug);
    Page<JobResponse> search(String keyword, String city, JobLevel level, Pageable pageable);
    List<JobResponse> getMyJobs(UUID recruitmentID);
    JobResponse update(UUID id,JobRequest request, UUID recruitmentID);
    JobResponse publish(UUID id, UUID recruitmentUD);
    JobResponse close(UUID id, UUID recruitmentID);


}

