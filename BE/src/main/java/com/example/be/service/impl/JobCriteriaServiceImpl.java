package com.example.be.service.impl;

import com.example.be.dto.request.JobCriteriaRequest;
import com.example.be.dto.response.JobCriteriaResponse;
import com.example.be.entity.Job;
import com.example.be.entity.JobCriteria;
import com.example.be.repository.JobCriteriaRepository;
import com.example.be.repository.JobRepository;
import com.example.be.service.inf.JobCriteriaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class JobCriteriaServiceImpl implements JobCriteriaService {

    private final JobCriteriaRepository jobCriteriaRepository;
    private final JobRepository jobRepository;

    @Override
    public JobCriteriaResponse createOrUpdate(UUID jobId,
                                              JobCriteriaRequest request,
                                              UUID recruiterId) {

        // 1. Kiá»ƒm tra job tá»“n táº¡i vÃ  thuá»™c vá» recruiter nÃ y
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "KhÃ´ng tÃ¬m tháº¥y job"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException(
                    "Báº¡n khÃ´ng cÃ³ quyá»n chá»‰nh sá»­a job nÃ y");
        }

        // 2. Validate tá»•ng trá»ng sá»‘ pháº£i = 100
        int totalWeight = request.getSkillWeight()
                + request.getExperienceWeight()
                + request.getEducationWeight();

        if (totalWeight != 100) {
            throw new RuntimeException(
                    "Tá»•ng trá»ng sá»‘ pháº£i báº±ng 100, hiá»‡n táº¡i = " + totalWeight);
        }

        // 3. Táº¡o má»›i hoáº·c cáº­p nháº­t náº¿u Ä‘Ã£ cÃ³
        JobCriteria criteria = jobCriteriaRepository
                .findByJobId(jobId)
                .orElse(JobCriteria.builder().job(job).build());

        criteria.setSkillWeight(request.getSkillWeight());
        criteria.setExperienceWeight(request.getExperienceWeight());
        criteria.setEducationWeight(request.getEducationWeight());
        criteria.setPassThreshold(request.getPassThreshold());
        criteria.setCustomInstructions(request.getCustomInstructions());

        jobCriteriaRepository.save(criteria);

        log.info("ÄÃ£ set criteria cho job: {} â€” skill:{}% exp:{}% edu:{}% threshold:{}",
                job.getTitle(),
                request.getSkillWeight(),
                request.getExperienceWeight(),
                request.getEducationWeight(),
                request.getPassThreshold());

        return mapToResponse(criteria);
    }

    @Override
    public JobCriteriaResponse getByJobId(UUID jobId, UUID recruiterId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay job"));

        if (!job.getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Ban khong co quyen xem tieu chi job nay");
        }

        JobCriteria criteria = jobCriteriaRepository
                .findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException(
                        "Job nay chua co tieu chuan cham diem"));
        return mapToResponse(criteria);
    }

    // â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private JobCriteriaResponse mapToResponse(JobCriteria criteria) {
        return JobCriteriaResponse.builder()
                .id(criteria.getId())
                .jobId(criteria.getJob().getId())
                .jobTitle(criteria.getJob().getTitle())
                .skillWeight(criteria.getSkillWeight())
                .experienceWeight(criteria.getExperienceWeight())
                .educationWeight(criteria.getEducationWeight())
                .passThreshold(criteria.getPassThreshold())
                .customInstructions(criteria.getCustomInstructions())
                .build();
    }
}
