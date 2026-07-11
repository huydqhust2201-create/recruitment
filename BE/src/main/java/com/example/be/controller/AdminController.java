package com.example.be.controller;

import com.example.be.dto.response.AdminStatsResponse;
import com.example.be.entity.Company;
import com.example.be.entity.Job;
import com.example.be.entity.User;
import com.example.be.entity.enums.JobStatus;
import com.example.be.entity.enums.Role;
import com.example.be.repository.*;
import com.example.be.service.inf.AiScoringService;
import com.example.be.service.inf.EmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final EmbeddingService embeddingService;
    private final AiScoringService aiScoringService;
    private final AiScoreResultRepository aiScoreResultRepository;

    @Transactional(readOnly = true)
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalUsers = userRepository.count();
        long totalCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CANDIDATE).count();
        long totalRecruiters = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.RECRUITER).count();
        long totalCompanies = companyRepository.count();
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.findAll().stream()
                .filter(j -> j.getStatus().name().equals("ACTIVE")).count();
        long totalApplications = applicationRepository.count();
        long activeSubscriptions = subscriptionRepository.countActive();

        return ResponseEntity.ok(AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalRecruiters(totalRecruiters)
                .totalCompanies(totalCompanies)
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .totalApplications(totalApplications)
                .activeSubscriptions(activeSubscriptions)
                .build());
    }

    @Transactional(readOnly = true)
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<Map<String, Object>> users = userRepository.findAll(pageable).stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName(),
                        "role", u.getRole().name(),
                        "isActive", u.isActive(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @Transactional(readOnly = true)
    @GetMapping("/companies")
    public ResponseEntity<List<Map<String, Object>>> getCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<Map<String, Object>> companies = companyRepository.findAll(pageable).stream()
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("name", c.getName());
                    m.put("industry", c.getIndustry() != null ? c.getIndustry() : "");
                    m.put("city", c.getCity() != null ? c.getCity() : "");
                    m.put("logoUrl", c.getLogoUrl() != null ? c.getLogoUrl() : "");
                    m.put("isVerified", c.isVerified());
                    m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
                    // Recruiter info — giúp admin biết công ty thuộc về ai
                    recruiterProfileRepository.findByCompanyId(c.getId()).ifPresentOrElse(
                        rp -> {
                            m.put("recruiterName", rp.getUser().getFullName());
                            m.put("recruiterEmail", rp.getUser().getEmail());
                        },
                        () -> {
                            m.put("recruiterName", "");
                            m.put("recruiterEmail", "");
                        }
                    );
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(companies);
    }

    @PutMapping("/companies/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyCompany(@PathVariable UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(true);
        companyRepository.save(company);
        return ResponseEntity.ok(Map.of("id", company.getId(), "isVerified", true, "name", company.getName()));
    }

    @PutMapping("/companies/{id}/unverify")
    public ResponseEntity<Map<String, Object>> unverifyCompany(@PathVariable UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(false);
        companyRepository.save(company);
        return ResponseEntity.ok(Map.of("id", company.getId(), "isVerified", false, "name", company.getName()));
    }

    @Transactional(readOnly = true)
    @GetMapping("/jobs")
    public ResponseEntity<List<Map<String, Object>>> getJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<Map<String, Object>> jobs = jobRepository.findAll(pageable).stream()
                .map(j -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", j.getId());
                    m.put("title", j.getTitle());
                    m.put("companyName", j.getCompany() != null ? j.getCompany().getName() : "");
                    m.put("city", j.getCity() != null ? j.getCity() : "");
                    m.put("status", j.getStatus().name());
                    m.put("applyCount", j.getApplyCount());
                    m.put("createdAt", j.getCreatedAt() != null ? j.getCreatedAt().toString() : "");
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobs);
    }

    @PutMapping("/jobs/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleJobActive(@PathVariable UUID id) {
        var jobRepo = jobRepository;
        var job = jobRepo.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
        var newStatus = job.getStatus().name().equals("ACTIVE") ? "PAUSED" : "ACTIVE";
        job.setStatus(com.example.be.entity.enums.JobStatus.valueOf(newStatus));
        jobRepo.save(job);
        return ResponseEntity.ok(Map.of("id", job.getId(), "status", newStatus));
    }

    @Transactional(readOnly = true)
    @GetMapping("/subscriptions")
    public ResponseEntity<List<Map<String, Object>>> getSubscriptions() {
        List<Map<String, Object>> subs = subscriptionRepository.findAll().stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId(),
                        "companyName", s.getCompany().getName(),
                        "planCode", s.getPlan().getCode().name(),
                        "status", s.getStatus().name(),
                        "startedAt", s.getStartedAt() != null ? s.getStartedAt().toString() : "",
                        "expiresAt", s.getExpiresAt() != null ? s.getExpiresAt().toString() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(subs);
    }

    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleUserActive(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("id", user.getId(), "isActive", user.isActive()));
    }

    @PostMapping("/jobs/generate-embeddings")
    public ResponseEntity<Map<String, Object>> generateJobEmbeddings() {
        // jdEmbedding là @Transient nên dùng native query để lọc jobs chưa có embedding
        List<Job> jobs = jobRepository.findJobsWithoutEmbedding();

        int total = jobs.size();
        AtomicInteger success = new AtomicInteger(0);
        AtomicInteger failed = new AtomicInteger(0);

        new Thread(() -> {
            for (Job job : jobs) {
                try {
                    float[] embedding = embeddingService.createJobEmbedding(
                            job.getTitle(), job.getDescription(), job.getRequirements());
                    if (embedding != null) {
                        StringBuilder sb = new StringBuilder("[");
                        for (int i = 0; i < embedding.length; i++) {
                            if (i > 0) sb.append(",");
                            sb.append(embedding[i]);
                        }
                        sb.append("]");
                        jobRepository.updateEmbedding(job.getId().toString(), sb.toString());
                        success.incrementAndGet();
                        log.info("Embedding done: {} ({}/{})", job.getTitle(), success.get(), total);
                    }
                    Thread.sleep(200);
                } catch (Exception e) {
                    failed.incrementAndGet();
                    log.warn("Embedding failed for job {}: {}", job.getId(), e.getMessage());
                }
            }
            log.info("Batch embedding complete: {}/{} success, {} failed", success.get(), total, failed.get());
        }).start();

        return ResponseEntity.ok(Map.of(
                "message", "Đang generate embeddings cho " + total + " jobs ở background",
                "total", total));
    }

    @PostMapping("/applications/score-all")
    public ResponseEntity<Map<String, Object>> scoreAllApplications() {
        List<UUID> unscored = applicationRepository.findAll().stream()
                .filter(a -> {
                    var existing = aiScoreResultRepository.findByApplicationId(a.getId());
                    return existing.isEmpty()
                            || existing.get().getFinalScore() == null
                            || existing.get().getFinalScore() == 0.0;
                })
                .map(a -> a.getId())
                .collect(Collectors.toList());

        int total = unscored.size();
        new Thread(() -> {
            AtomicInteger done = new AtomicInteger(0);
            for (UUID appId : unscored) {
                try {
                    aiScoringService.scoreApplication(appId);
                    done.incrementAndGet();
                    log.info("Scored {}/{}", done.get(), total);
                    Thread.sleep(500);
                } catch (Exception e) {
                    log.warn("Score failed for application {}: {}", appId, e.getMessage());
                }
            }
            log.info("Batch scoring complete: {}/{}", done.get(), total);
        }).start();

        return ResponseEntity.ok(Map.of(
                "message", "Đang chấm điểm AI cho " + total + " applications ở background",
                "total", total));
    }
}
