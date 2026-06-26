package com.example.be.service.inf;

import com.example.be.dto.request.ApplicationRequest;
import com.example.be.dto.request.UpdateApplicationStatusRequest;
import com.example.be.dto.response.ApplicationResponse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationService {

    ApplicationResponse apply(ApplicationRequest request, UUID candidateUserId);

    List<ApplicationResponse> getMyApplications(UUID candidateUserId);

    Optional<ApplicationResponse> getMyApplicationForJob(UUID jobId, UUID candidateUserId);

    List<ApplicationResponse> getApplicationsByJob(UUID jobId, UUID recruiterUserId);

    ApplicationResponse getByIdForRecruiter(UUID id, UUID recruiterUserId);

    List<ApplicationResponse> getAllApplicationsForRecruiter(UUID recruiterUserId);

    ApplicationResponse updateStatus(UUID id, UpdateApplicationStatusRequest request, UUID actorUserId, boolean isCandidate);
}
