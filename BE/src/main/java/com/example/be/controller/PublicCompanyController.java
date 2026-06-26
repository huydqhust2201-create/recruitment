package com.example.be.controller;

import com.example.be.dto.response.CompanyResponse;
import com.example.be.entity.Job;
import com.example.be.entity.enums.JobStatus;
import com.example.be.repository.JobRepository;
import com.example.be.service.inf.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/companies")
@RequiredArgsConstructor
public class PublicCompanyController {

    private final JobRepository jobRepository;
    private final CompanyService companyService;

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CompanyResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(companyService.getBySlug(slug));
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<Map<String, Object>>> getCompanyJobs(@PathVariable UUID id) {
        List<Job> jobs = jobRepository.findByCompanyIdAndStatus(id, JobStatus.ACTIVE);
        List<Map<String, Object>> result = jobs.stream().map(job -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", job.getId());
            m.put("title", job.getTitle());
            m.put("slug", job.getSlug());
            m.put("city", job.getCity());
            m.put("jobType", job.getJobType() != null ? job.getJobType().name() : "");
            m.put("level", job.getLevel() != null ? job.getLevel().name() : "");
            m.put("salaryMin", job.getSalaryMin());
            m.put("salaryMax", job.getSalaryMax());
            m.put("isSalaryPublic", job.isSalaryPublic());
            m.put("applyCount", job.getApplyCount());
            m.put("deadline", job.getDeadline() != null ? job.getDeadline().toString() : null);
            m.put("publishedAt", job.getPublishedAt() != null ? job.getPublishedAt().toString() : null);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
