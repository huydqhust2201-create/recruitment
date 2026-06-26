package com.example.be.controller;

import com.example.be.dto.response.AdminStatsResponse;
import com.example.be.entity.Company;
import com.example.be.entity.User;
import com.example.be.entity.enums.Role;
import com.example.be.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanySubscriptionRepository subscriptionRepository;

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
}
