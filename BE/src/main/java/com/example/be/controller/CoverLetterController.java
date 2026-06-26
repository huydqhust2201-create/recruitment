package com.example.be.controller;

import com.example.be.dto.request.CoverLetterRequest;
import com.example.be.dto.response.CoverLetterResponse;
import com.example.be.entity.*;
import com.example.be.entity.enums.AiFeature;
import com.example.be.repository.*;
import com.example.be.service.inf.AiUsageLogService;
import com.example.be.service.impl.LlmScoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/cover-letter")
@RequiredArgsConstructor
public class CoverLetterController {

    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final CvFileRepository cvFileRepository;
    private final CvParseResultRepository cvParseResultRepository;
    private final JobRepository jobRepository;
    private final LlmScoringService llmScoringService;
    private final AiUsageLogService aiUsageLogService;

    @PostMapping("/generate")
    public ResponseEntity<CoverLetterResponse> generate(
            @Valid @RequestBody CoverLetterRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"))
                .getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job không tồn tại"));

        // Null-safe company name
        String companyName = "";
        try { companyName = job.getCompany() != null ? job.getCompany().getName() : ""; }
        catch (Exception ignored) {}

        String cvText = candidateProfileRepository.findByUserId(userId)
                .flatMap(profile -> cvFileRepository.findByCandidateIdAndIsPrimaryTrue(profile.getId()))
                .flatMap(cvFile -> cvParseResultRepository.findByCvFileId(cvFile.getId()))
                .map(CvParseResult::getRawText)
                .orElse("");

        String content;
        boolean aiSuccess = false;
        try {
            content = llmScoringService.generateCoverLetter(
                    cvText, job.getTitle(), companyName,
                    job.getDescription(), job.getRequirements(), user.getFullName());
            aiSuccess = content != null;
        } catch (Exception e) {
            content = null;
        }

        if (content == null || content.isBlank()) {
            content = buildFallbackLetter(user.getFullName(), job.getTitle(), companyName);
        }

        try { aiUsageLogService.logUsage(userId, AiFeature.COVER_LETTER, 0, 0, aiSuccess); }
        catch (Exception ignored) {}

        return ResponseEntity.ok(CoverLetterResponse.builder()
                .content(content)
                .jobTitle(job.getTitle())
                .companyName(companyName)
                .build());
    }

    private String buildFallbackLetter(String candidateName, String jobTitle, String companyName) {
        String co = (companyName == null || companyName.isBlank()) ? "quý công ty" : companyName;
        return String.format("""
                Kính gửi Ban Tuyển dụng %s,

                Tôi là %s, xin được ứng tuyển vào vị trí %s tại %s.

                Qua tìm hiểu về %s, tôi nhận thấy đây là môi trường làm việc chuyên nghiệp, năng động với nhiều cơ hội phát triển. Tôi tin rằng những kỹ năng và kinh nghiệm của mình sẽ đóng góp tích cực cho sự phát triển của công ty.

                Với nền tảng kiến thức chuyên môn vững chắc cùng tinh thần học hỏi không ngừng, tôi luôn hoàn thành tốt các nhiệm vụ được giao và sẵn sàng đối mặt với những thách thức mới. Tôi có khả năng làm việc độc lập cũng như hợp tác hiệu quả trong môi trường nhóm.

                Tôi rất mong được có cơ hội trao đổi trực tiếp để chia sẻ thêm về kinh nghiệm và sự phù hợp của mình với vị trí %s. Kính mong quý công ty xem xét hồ sơ của tôi.

                Trân trọng,
                %s
                """, co, candidateName, jobTitle, co, co, jobTitle, candidateName);
    }
}
