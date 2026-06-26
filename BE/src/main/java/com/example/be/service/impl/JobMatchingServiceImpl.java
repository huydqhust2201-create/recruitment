package com.example.be.service.impl;

import com.example.be.config.VectorConverter;
import com.example.be.dto.response.JobResponse;
import com.example.be.dto.response.RecommendedJobsResponse;
import com.example.be.entity.CandidateProfile;
import com.example.be.entity.Job;
import com.example.be.entity.JobRecommendation;
import com.example.be.entity.enums.AiFeature;
import com.example.be.entity.enums.JobStatus;
import com.example.be.repository.CandidateProfileRepository;
import com.example.be.repository.JobRecommendationRepository;
import com.example.be.repository.JobRepository;
import com.example.be.repository.VectorSearchRepository;
import com.example.be.service.inf.AiUsageLogService;
import com.example.be.service.inf.JobMatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class JobMatchingServiceImpl implements JobMatchingService {

    private static final int RECOMMENDATION_LIMIT = 10;

    private final CandidateProfileRepository candidateProfileRepository;
    private final VectorSearchRepository vectorSearchRepository;
    private final JobRepository jobRepository;
    private final JobRecommendationRepository jobRecommendationRepository;
    private final AiUsageLogService aiUsageLogService;

    @Override
    public RecommendedJobsResponse getRecommendedJobs(UUID candidateUserId) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new RuntimeException("Chua co ho so ung vien"));

        float[] cvEmbedding = profile.getCvEmbedding();
        if (cvEmbedding == null) {
            return RecommendedJobsResponse.builder()
                    .hasCvEmbedding(false)
                    .jobs(fallbackJobs())
                    .build();
        }

        String embeddingVector = VectorConverter.toPgVector(cvEmbedding);
        List<Object[]> rows = vectorSearchRepository.findSimilarJobIds(embeddingVector, RECOMMENDATION_LIMIT);

        List<JobResponse> jobs = new ArrayList<>();
        for (Object[] row : rows) {
            UUID jobId = toUuid(row[0]);
            Double similarity = row[1] != null ? ((Number) row[1]).doubleValue() : null;

            jobRepository.findByIdWithSkills(jobId).ifPresent(job -> {
                jobs.add(mapToResponse(job, similarity));
                saveRecommendation(profile, job, similarity);
            });
        }

        aiUsageLogService.logUsage(candidateUserId, AiFeature.JOB_RECOMMEND, 0, 0, true);

        return RecommendedJobsResponse.builder()
                .hasCvEmbedding(true)
                .jobs(jobs)
                .build();
    }

    private void saveRecommendation(CandidateProfile profile, Job job, Double similarity) {
        if (similarity == null) {
            return;
        }
        JobRecommendation recommendation = jobRecommendationRepository
                .findByCandidateIdAndJobId(profile.getId(), job.getId())
                .orElse(JobRecommendation.builder()
                        .candidate(profile)
                        .job(job)
                        .build());
        recommendation.setSimilarityScore(similarity);
        jobRecommendationRepository.save(recommendation);
    }

    private List<JobResponse> fallbackJobs() {
        return jobRepository
                .findByStatus(JobStatus.ACTIVE, PageRequest.of(0, RECOMMENDATION_LIMIT, Sort.by("createdAt").descending()))
                .stream()
                .map(job -> mapToResponse(job, null))
                .collect(Collectors.toList());
    }

    private JobResponse mapToResponse(Job job, Double similarityScore) {
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
                .similarityScore(similarityScore)
                .build();
    }

    private UUID toUuid(Object value) {
        if (value instanceof UUID uuid) {
            return uuid;
        }
        return UUID.fromString(value.toString());
    }
}
