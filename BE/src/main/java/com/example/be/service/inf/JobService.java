package com.example.be.service.inf;

import com.example.be.dto.request.JobRequest;
import com.example.be.dto.response.JobResponse;
import com.example.be.entity.Job;
import com.example.be.entity.enums.JobLevel;
import com.example.be.entity.enums.JobType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface JobService  {
    JobResponse create(JobRequest request, UUID recruitmentID);
    JobResponse getById(UUID id);
    JobResponse getMyJobById(UUID id, UUID recruiterId);
    JobResponse getBySlug(String slug);
    Page<JobResponse> search(String keyword, String city, JobLevel level, String industry,
                             JobType jobType, Long salaryMin, Pageable pageable);
    List<JobResponse> getMyJobs(UUID recruitmentID);
    JobResponse update(UUID id, JobRequest request, UUID recruitmentID);
    JobResponse publish(UUID id, UUID recruitmentUD);
    JobResponse close(UUID id, UUID recruitmentID);
    JobResponse pause(UUID id, UUID recruiterId);
    JobResponse resume(UUID id, UUID recruiterId);
    /** Map a Job entity to JobResponse (used by SavedJobController) */
    JobResponse toResponse(Job job);
}

