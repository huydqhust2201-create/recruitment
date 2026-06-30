package com.example.be.controller;

import com.example.be.dto.request.JobRequest;
import com.example.be.dto.request.NaturalSearchRequest;
import com.example.be.dto.response.JobResponse;
import com.example.be.dto.response.NaturalSearchResponse;
import com.example.be.entity.enums.JobLevel;
import com.example.be.entity.enums.JobType;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.AiUsageLogService;
import com.example.be.service.inf.JobService;
import com.example.be.entity.enums.AiFeature;
import com.example.be.service.impl.LlmScoringService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final LlmScoringService llmScoringService;
    private final AiUsageLogService aiUsageLogService;

    // â”€â”€ PUBLIC endpoints (khÃ´ng cáº§n login) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    @GetMapping("/api/jobs")
    public ResponseEntity<Page<JobResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) JobLevel level,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) Long salaryMin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        return ResponseEntity.ok(
                jobService.search(keyword, city, level, industry, jobType, salaryMin, pageable)
        );
    }

    @PostMapping("/api/jobs/search/nl")
    public ResponseEntity<Map<String, Object>> naturalLanguageSearch(
            @Valid @RequestBody NaturalSearchRequest request) {

        Map<String, String> filters;
        try {
            filters = llmScoringService.parseNaturalLanguageSearch(request.getQuery());
        } catch (Exception e) {
            filters = Map.of("summary", "Không thể phân tích câu hỏi, hiển thị kết quả tổng hợp.");
        }
        try { aiUsageLogService.logUsage(null, AiFeature.NL_SEARCH, 0, 0, !filters.isEmpty()); }
        catch (Exception ignored) {}

        String keyword  = filters.getOrDefault("keyword", "");
        String city     = filters.getOrDefault("city", "");
        String levelStr = filters.getOrDefault("level", "");
        String industry = filters.getOrDefault("industry", "");
        String summary  = filters.getOrDefault("summary", request.getQuery());

        JobLevel level = null;
        try { if (!levelStr.isBlank()) level = JobLevel.valueOf(levelStr); }
        catch (IllegalArgumentException ignored) {}

        PageRequest pageable = PageRequest.of(0, 12, Sort.by("createdAt").descending());
        Page<JobResponse> jobs = jobService.search(keyword, city, level, industry, null, null, pageable);

        NaturalSearchResponse parsed = NaturalSearchResponse.builder()
                .keyword(keyword).city(city).level(levelStr)
                .industry(industry).summary(summary)
                .minSalary(parseLong(filters.get("min_salary")))
                .maxSalary(parseLong(filters.get("max_salary")))
                .build();

        return ResponseEntity.ok(Map.of("parsed", parsed, "jobs", jobs));
    }

    private Long parseLong(String s) {
        try { return s != null && !s.isBlank() ? Long.parseLong(s) : null; }
        catch (NumberFormatException e) { return null; }
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

    @GetMapping("/api/recruiter/jobs/{id}")
    public ResponseEntity<JobResponse> getMyJobById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.getMyJobById(id, getUserId(userDetails)));
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

    @PutMapping("/api/recruiter/jobs/{id}/pause")
    public ResponseEntity<JobResponse> pause(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.pause(id, getUserId(userDetails)));
    }

    @PutMapping("/api/recruiter/jobs/{id}/resume")
    public ResponseEntity<JobResponse> resume(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                jobService.resume(id, getUserId(userDetails)));
    }

    // â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"))
                .getId();
    }
}
