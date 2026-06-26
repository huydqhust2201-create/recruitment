package com.example.be.service.impl;

import com.example.be.dto.response.AiScoreResponse;
import com.example.be.dto.response.LlmScoringResult;
import com.example.be.entity.*;
import com.example.be.entity.enums.AiFeature;
import com.example.be.repository.*;
import com.example.be.service.inf.AiScoringService;
import com.example.be.service.inf.AiUsageLogService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AiScoringServiceImpl implements AiScoringService {

    private final ApplicationRepository applicationRepository;
    private final JobCriteriaRepository jobCriteriaRepository;
    private final AiScoreResultRepository aiScoreResultRepository;
    private final CvParseResultRepository cvParseResultRepository;
    private final VectorSearchRepository vectorSearchRepository;
    private final LlmScoringService llmScoringService;
    private final AiUsageLogService aiUsageLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    @Async("aiTaskExecutor")
    @Transactional
    public void scoreApplicationAsync(UUID applicationId) {
        try {
            scoreApplication(applicationId);
        } catch (Exception e) {
            log.warn("Async scoring failed for application {}: {}", applicationId, e.getMessage());
        }
    }

    @Override
    public AiScoreResponse scoreApplication(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don ung tuyen"));

        Job job = application.getJob();
        User candidate = application.getCandidate();
        CvFile cvFile = application.getCvFile();

        JobCriteria criteria = jobCriteriaRepository.findByJobId(job.getId()).orElse(null);
        int skillWeight = criteria != null ? criteria.getSkillWeight() : 40;
        int experienceWeight = criteria != null ? criteria.getExperienceWeight() : 35;
        int educationWeight = criteria != null ? criteria.getEducationWeight() : 25;
        double passThreshold = criteria != null ? criteria.getPassThreshold() : 0.70;
        String customInstructions = criteria != null ? criteria.getCustomInstructions() : null;

        Double vectorScore = vectorSearchRepository
                .computeVectorSimilarity(candidate.getId(), job.getId())
                .orElse(null);

        String cvText = cvParseResultRepository.findByCvFileId(cvFile.getId())
                .map(CvParseResult::getRawText)
                .orElse("CV: " + cvFile.getFileName());

        LlmScoringResult llmResult = llmScoringService.scoreCvAgainstJob(
                cvText,
                job.getTitle(),
                job.getDescription(),
                job.getRequirements(),
                customInstructions
        );

        double skillScore = llmResult != null ? clamp(llmResult.getSkillScore()) : 0.0;
        double experienceScore = llmResult != null ? clamp(llmResult.getExperienceScore()) : 0.0;
        double educationScore = llmResult != null ? clamp(llmResult.getEducationScore()) : 0.0;
        double llmScore = (skillScore + experienceScore + educationScore) / 3.0;

        double finalScore = skillScore * (skillWeight / 100.0)
                + experienceScore * (experienceWeight / 100.0)
                + educationScore * (educationWeight / 100.0);

        boolean passed = finalScore >= passThreshold;

        AiScoreResult scoreResult = aiScoreResultRepository.findByApplicationId(applicationId)
                .orElse(AiScoreResult.builder().application(application).build());

        scoreResult.setVectorScore(vectorScore);
        scoreResult.setLlmScore(llmScore);
        scoreResult.setSkillScore(skillScore);
        scoreResult.setExperienceScore(experienceScore);
        scoreResult.setEducationScore(educationScore);
        scoreResult.setFinalScore(finalScore);
        scoreResult.setStrengths(llmResult != null ? llmResult.getStrengths() : null);
        scoreResult.setWeaknesses(llmResult != null ? llmResult.getWeaknesses() : null);
        scoreResult.setRecommendation(llmResult != null ? llmResult.getRecommendation() : null);
        scoreResult.setMatchedSkills(llmResult != null ? toJson(llmResult.getMatchedSkills()) : null);
        scoreResult.setMissingSkills(llmResult != null ? toJson(llmResult.getMissingSkills()) : null);
        scoreResult.setImprovementSuggestions(llmResult != null ? toJson(llmResult.getImprovementSuggestions()) : null);
        scoreResult.setAiModelUsed(llmResult != null ? llmResult.getModelUsed() : null);
        scoreResult.setTokensUsed(llmResult != null ? llmResult.getTokensUsed() : 0);

        aiScoreResultRepository.save(scoreResult);

        application.setAiMatchScore(finalScore);
        application.setPassedThreshold(passed);
        applicationRepository.save(application);

        aiUsageLogService.logUsage(
                candidate.getId(),
                AiFeature.CV_SCORE,
                llmResult != null ? llmResult.getTokensUsed() : 0,
                0,
                llmResult != null
        );

        return mapToResponse(scoreResult);
    }

    @Override
    @Transactional(readOnly = true)
    public AiScoreResponse getScoreForRecruiter(UUID applicationId, UUID recruiterUserId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don ung tuyen"));

        if (!application.getJob().getRecruiter().getId().equals(recruiterUserId)) {
            throw new RuntimeException("Ban khong co quyen xem diem AI");
        }

        return aiScoreResultRepository.findByApplicationId(applicationId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Ung vien chua duoc cham diem AI"));
    }

    private String toJson(List<String> list) {
        try { return list == null ? null : objectMapper.writeValueAsString(list); }
        catch (Exception e) { return null; }
    }

    private List<String> fromJson(String json) {
        try {
            if (json == null || json.isBlank()) return Collections.emptyList();
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) { return Collections.emptyList(); }
    }

    @Override
    @Transactional(readOnly = true)
    public AiScoreResponse getScoreForCandidate(UUID applicationId, UUID candidateUserId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển"));

        if (!application.getCandidate().getId().equals(candidateUserId)) {
            throw new RuntimeException("Bạn không có quyền xem điểm này");
        }

        return aiScoreResultRepository.findByApplicationId(applicationId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Chưa có điểm AI"));
    }

    private double clamp(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }

    private AiScoreResponse mapToResponse(AiScoreResult result) {
        return AiScoreResponse.builder()
                .id(result.getId())
                .applicationId(result.getApplication().getId())
                .vectorScore(result.getVectorScore())
                .llmScore(result.getLlmScore())
                .skillScore(result.getSkillScore())
                .experienceScore(result.getExperienceScore())
                .educationScore(result.getEducationScore())
                .finalScore(result.getFinalScore())
                .strengths(result.getStrengths())
                .weaknesses(result.getWeaknesses())
                .recommendation(result.getRecommendation())
                .matchedSkills(fromJson(result.getMatchedSkills()))
                .missingSkills(fromJson(result.getMissingSkills()))
                .improvementSuggestions(fromJson(result.getImprovementSuggestions()))
                .aiModelUsed(result.getAiModelUsed())
                .tokensUsed(result.getTokensUsed())
                .scoredAt(result.getScoredAt())
                .build();
    }
}
