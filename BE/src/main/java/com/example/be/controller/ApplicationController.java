package com.example.be.controller;

import com.example.be.dto.request.ApplicationRequest;
import com.example.be.dto.request.UpdateApplicationStatusRequest;
import com.example.be.dto.response.AiScoreResponse;
import com.example.be.dto.response.ApplicationResponse;
import com.example.be.entity.enums.ApplicationStatus;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.AiScoringService;
import com.example.be.service.inf.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AiScoringService aiScoringService;
    private final UserRepository userRepository;

    @PostMapping("/api/applications")
    public ResponseEntity<ApplicationResponse> apply(
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.apply(request, userId));
    }

    @GetMapping("/api/candidate/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.getMyApplications(getUserId(userDetails)));
    }

    @GetMapping("/api/candidate/applications/job/{jobId}")
    public ResponseEntity<ApplicationResponse> getMyApplicationForJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return applicationService
                .getMyApplicationForJob(jobId, getUserId(userDetails))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/candidate/applications/{id}/score")
    public ResponseEntity<AiScoreResponse> getMyScore(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                aiScoringService.getScoreForCandidate(id, getUserId(userDetails)));
    }

    @PutMapping("/api/candidate/applications/{id}/withdraw")
    public ResponseEntity<ApplicationResponse> withdraw(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        UpdateApplicationStatusRequest request = new UpdateApplicationStatusRequest();
        request.setStatus(ApplicationStatus.WITHDRAWN);
        return ResponseEntity.ok(
                applicationService.updateStatus(id, request, getUserId(userDetails), true));
    }

    @GetMapping("/api/recruiter/applications")
    public ResponseEntity<List<ApplicationResponse>> getAllApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.getAllApplicationsForRecruiter(getUserId(userDetails)));
    }

    @GetMapping("/api/recruiter/jobs/{jobId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.getApplicationsByJob(jobId, getUserId(userDetails)));
    }

    @GetMapping("/api/recruiter/applications/{id}")
    public ResponseEntity<ApplicationResponse> getByIdForRecruiter(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.getByIdForRecruiter(id, getUserId(userDetails)));
    }

    @PutMapping("/api/recruiter/applications/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                applicationService.updateStatus(id, request, getUserId(userDetails), false));
    }

    @GetMapping("/api/recruiter/applications/{id}/score")
    public ResponseEntity<AiScoreResponse> getApplicationScore(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                aiScoringService.getScoreForRecruiter(id, getUserId(userDetails)));
    }

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User khong ton tai"))
                .getId();
    }
}
