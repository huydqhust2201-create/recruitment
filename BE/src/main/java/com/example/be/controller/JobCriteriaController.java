package com.example.be.controller;

import com.example.be.dto.request.JobCriteriaRequest;
import com.example.be.dto.response.JobCriteriaResponse;
import com.example.be.entity.User;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.JobCriteriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/recruiter/jobs")
@RequiredArgsConstructor
public class JobCriteriaController {

    private final JobCriteriaService jobCriteriaService;
    private final UserRepository userRepository;

    // Táº¡o hoáº·c cáº­p nháº­t criteria
    @PostMapping("/{jobId}/criteria")
    public ResponseEntity<JobCriteriaResponse> createOrUpdate(
            @PathVariable UUID jobId,
            @Valid @RequestBody JobCriteriaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID recruiterId = getUserId(userDetails);
        return ResponseEntity.ok(
                jobCriteriaService.createOrUpdate(jobId, request, recruiterId));
    }

    // Xem criteria cá»§a job
    @GetMapping("/{jobId}/criteria")
    public ResponseEntity<JobCriteriaResponse> getByJobId(
            @PathVariable UUID jobId) {
        return ResponseEntity.ok(jobCriteriaService.getByJobId(jobId));
    }

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"))
                .getId();
    }
}
