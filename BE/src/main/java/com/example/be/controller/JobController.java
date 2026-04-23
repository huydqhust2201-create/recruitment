package com.example.be.controller;

import com.example.be.dto.request.JobRequest;
import com.example.be.dto.response.JobResponse;
import com.example.be.entity.enums.JobLevel;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    // â”€â”€ PUBLIC endpoints (khÃ´ng cáº§n login) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/api/jobs")
    public ResponseEntity<Page<JobResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) JobLevel level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        return ResponseEntity.ok(
                jobService.search(keyword, city, level, pageable)
        );
    }

    @GetMapping("/api/jobs/{id}")
    public ResponseEntity<JobResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(jobService.getById(id));
    }

    @GetMapping("/api/jobs/slug/{slug}")
    public ResponseEntity<JobResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(jobService.getBySlug(slug));
    }

    // â”€â”€ RECRUITER endpoints (cáº§n login + role RECRUITER) â”€â”€â”€â”€
    @PostMapping("/api/recruiter/jobs")
    public ResponseEntity<JobResponse> create(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.create(request, getUserId(userDetails)));
    }

    @GetMapping("/api/recruiter/jobs")
    public ResponseEntity<List<JobResponse>> getMyJobs(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.getMyJobs(getUserId(userDetails)));
    }

    @PutMapping("/api/recruiter/jobs/{id}")
    public ResponseEntity<JobResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.update(id, request, getUserId(userDetails)));
    }

    @PutMapping("/api/recruiter/jobs/{id}/publish")
    public ResponseEntity<JobResponse> publish(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.publish(id, getUserId(userDetails)));
    }

    @PutMapping("/api/recruiter/jobs/{id}/close")
    public ResponseEntity<JobResponse> close(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.close(id, getUserId(userDetails)));
    }

    // â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"))
                .getId();
    }
}
