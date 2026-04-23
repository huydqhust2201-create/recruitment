package com.example.be.service.impl;

import com.example.be.dto.request.JobRequest;
import com.example.be.dto.response.JobResponse;
import com.example.be.entity.*;
import com.example.be.entity.enums.JobLevel;
import com.example.be.entity.enums.JobStatus;
import com.example.be.repository.*;
import com.example.be.service.inf.EmbeddingService;
import com.example.be.service.inf.JobService;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final EmbeddingService embeddingService;

    @Override
    @Transactional
    public JobResponse create(JobRequest request, UUID recruiterId) {

        // 1. Láº¥y thÃ´ng tin recruiter
        User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"));

        // 2. Láº¥y company cá»§a recruiter
        RecruiterProfile profile = recruiterProfileRepository
                .findByUserId(recruiterId)
                .orElseThrow(() -> new RuntimeException(
                        "Báº¡n chÆ°a cÃ³ há»“ sÆ¡ recruiter, vui lÃ²ng táº¡o cÃ´ng ty trÆ°á»›c"));

        Company company = profile.getCompany();

        // 3. Táº¡o slug tá»« title
        String slug = generateSlug(request.getTitle());

        // 4. Táº¡o job
        Job job = Job.builder()
                .company(company)
                .recruiter(recruiter)
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .jobType(request.getJobType())
                .level(request.getLevel())
                .industry(request.getIndustry())
                .city(request.getCity())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .isSalaryPublic(request.isSalaryPublic())
                .deadline(request.getDeadline())
                .status(JobStatus.DRAFT)
                .build();

        // 5. Gáº¯n skills vÃ o job
        if (request.getSkills() != null) {
            List<JobSkill> jobSkills = request.getSkills().stream()
                    .map(s -> {
                        Skill skill = skillRepository.findById(s.getSkillId())
                                .orElseThrow(() -> new RuntimeException(
                                        "KhÃ´ng tÃ¬m tháº¥y skill: " + s.getSkillId()));
                        return JobSkill.builder()
                                .job(job)
                                .skill(skill)
                                .isRequired(s.isRequired())
                                .level(s.getLevel())
                                .build();
                    })
                    .collect(Collectors.toList());
            job.setJobSkills(jobSkills);
        }

        jobRepository.save(job);
        return mapToResponse(job);
    }
    @Transactional
    @Override
    public JobResponse publish(UUID id, UUID recruiterId) {
        Job job = getJobAndValidateOwner(id, recruiterId);

        // Táº¡o jd_embedding trÆ°á»›c khi publish
        float[] embedding = embeddingService.createJobEmbedding(
                job.getTitle(),
                job.getDescription(),
                job.getRequirements()
        );

        if (embedding != null) {
            job.setJdEmbedding(embedding);
            log.info("ÄÃ£ táº¡o jd_embedding cho job: {}", job.getTitle());
        } else {
            log.warn("KhÃ´ng táº¡o Ä‘Æ°á»£c embedding, publish váº«n tiáº¿p tá»¥c");
        }

        job.setStatus(JobStatus.ACTIVE);
        job.setPublishedAt(LocalDateTime.now());
        jobRepository.save(job);
        return mapToResponse(job);
    }

    @Override
    public JobResponse close(UUID id, UUID recruiterId) {
        Job job = getJobAndValidateOwner(id, recruiterId);
        job.setStatus(JobStatus.CLOSED);
        jobRepository.save(job);
        return mapToResponse(job);
    }

    @Override
    @Transactional
    public JobResponse getById(UUID id) {
        Job job = jobRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y job"));

        job.setViewCount(job.getViewCount() + 1);
        jobRepository.save(job);

        return mapToResponse(job);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponse getBySlug(String slug) {
        Job job = jobRepository.findBySlugWithSkills(slug)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y job"));
        return mapToResponse(job);
    }

    @Override
    public Page<JobResponse> search(String keyword, String city,
                                    JobLevel level, Pageable pageable) {

        keyword = (keyword == null) ? "" : keyword.trim();
        city = (city == null) ? "" : city.trim();

        return jobRepository.search(keyword, city, level, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<JobResponse> getMyJobs(UUID recruiterId) {
        return jobRepository.findByRecruiterId(recruiterId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobResponse update(UUID id, JobRequest request, UUID recruiterId) {
        Job job = getJobAndValidateOwner(id, recruiterId);

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setBenefits(request.getBenefits());
        job.setJobType(request.getJobType());
        job.setLevel(request.getLevel());
        job.setCity(request.getCity());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setDeadline(request.getDeadline());

        jobRepository.save(job);
        return mapToResponse(job);
    }

    // â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private Job getJobAndValidateOwner(UUID jobId, UUID recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y job"));
        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Báº¡n khÃ´ng cÃ³ quyá»n chá»‰nh sá»­a job nÃ y");
        }
        return job;
    }

    private String generateSlug(String title) {
        String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
        String finalSlug = slug;
        int count = 1;
        while (jobRepository.existsBySlug(finalSlug)) {
            finalSlug = slug + "-" + count++;
        }
        return finalSlug;
    }

    private JobResponse mapToResponse(Job job) {
        List<JobResponse.SkillInfo> skills = job.getJobSkills().stream()
                .map(js -> JobResponse.SkillInfo.builder()
                        .skillId(js.getSkill().getId())
                        .skillName(js.getSkill().getName())
                        .isRequired(js.isRequired())
                        .level(js.getLevel())
                        .build())
                .collect(Collectors.toList());

        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .slug(job.getSlug())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .jobType(job.getJobType().name())
                .level(job.getLevel().name())
                .industry(job.getIndustry())
                .city(job.getCity())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .isSalaryPublic(job.isSalaryPublic())
                .status(job.getStatus().name())
                .viewCount(job.getViewCount())
                .applyCount(job.getApplyCount())
                .deadline(job.getDeadline())
                .publishedAt(job.getPublishedAt())
                .createdAt(job.getCreatedAt())
                .companyId(job.getCompany().getId())
                .companyName(job.getCompany().getName())
                .companyLogo(job.getCompany().getLogoUrl())
                .skills(skills)
                .build();
    }
}
