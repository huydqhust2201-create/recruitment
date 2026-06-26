package com.example.be.service.impl;

import com.example.be.dto.cvbuilder.CvBuilderContent;
import com.example.be.dto.request.CvBuilderRequest;
import com.example.be.dto.response.CvBuilderResponse;
import com.example.be.dto.response.CvFileResponse;
import com.example.be.entity.CandidateProfile;
import com.example.be.entity.CvBuilderDocument;
import com.example.be.entity.CvFile;
import com.example.be.entity.CvParseResult;
import com.example.be.entity.User;
import com.example.be.repository.CandidateProfileRepository;
import com.example.be.repository.CvBuilderDocumentRepository;
import com.example.be.repository.CvFileRepository;
import com.example.be.repository.CvParseResultRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.CvBuilderService;
import com.example.be.service.inf.CvPdfGeneratorService;
import com.example.be.service.inf.MinioService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CvBuilderServiceImpl implements CvBuilderService {

    private final CvBuilderDocumentRepository documentRepository;
    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CvFileRepository cvFileRepository;
    private final CvParseResultRepository cvParseResultRepository;
    private final MinioService minioService;
    private final CvPdfGeneratorService pdfGeneratorService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CvBuilderResponse> getMyDocuments(UUID userId) {
        UUID candidateId = getOrCreateProfile(userId).getId();
        return documentRepository.findByCandidateIdOrderByUpdatedAtDesc(candidateId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CvBuilderResponse getById(UUID userId, UUID id) {
        return mapToResponse(findOwned(userId, id));
    }

    @Override
    public CvBuilderResponse create(UUID userId, CvBuilderRequest request) {
        CandidateProfile profile = getOrCreateProfile(userId);
        CvBuilderDocument document = CvBuilderDocument.builder()
                .candidate(profile)
                .title(blankToDefault(request.getTitle()))
                .template(request.getTemplate())
                .content(toJson(request.getContent()))
                .build();
        documentRepository.save(document);
        log.info("Đã tạo CV builder document cho candidate: {}", profile.getId());
        return mapToResponse(document);
    }

    @Override
    public CvBuilderResponse update(UUID userId, UUID id, CvBuilderRequest request) {
        CvBuilderDocument document = findOwned(userId, id);
        document.setTitle(blankToDefault(request.getTitle()));
        document.setTemplate(request.getTemplate());
        document.setContent(toJson(request.getContent()));
        documentRepository.save(document);
        return mapToResponse(document);
    }

    @Override
    public void delete(UUID userId, UUID id) {
        CvBuilderDocument document = findOwned(userId, id);
        documentRepository.delete(document);
        log.info("Đã xóa CV builder document: {}", id);
    }

    @Override
    public CvFileResponse exportToPdf(UUID userId, UUID id) {
        CvBuilderDocument document = findOwned(userId, id);
        CandidateProfile profile = document.getCandidate();
        CvBuilderContent content = fromJson(document.getContent());

        byte[] pdfBytes = pdfGeneratorService.generate(content, document.getTemplate());

        String fileName = sanitizeFileName(document.getTitle()) + ".pdf";
        String fileUrl = minioService.uploadBytes(
                pdfBytes, fileName, "application/pdf", "cv/" + userId);

        boolean isFirst = cvFileRepository.countByCandidateId(profile.getId()) == 0;
        CvFile cvFile = CvFile.builder()
                .candidate(profile)
                .fileUrl(fileUrl)
                .fileName(fileName)
                .fileType("PDF")
                .fileSizeKb(Math.max(1, pdfBytes.length / 1024))
                .isPrimary(isFirst)
                .build();
        cvFileRepository.save(cvFile);

        // Da co du lieu structured -> tao luon CvParseResult voi do tin cay cao,
        // khong can OCR lai, giup AI scoring cham CV nay tot ngay tu dau.
        CvParseResult parseResult = CvParseResult.builder()
                .cvFile(cvFile)
                .candidate(profile)
                .rawText(toPlainText(content))
                .parseConfidence(1.0)
                .aiModelUsed("cv-builder")
                .build();
        cvParseResultRepository.save(parseResult);

        document.setExportedCvFile(cvFile);
        documentRepository.save(document);

        log.info("Đã xuất PDF cho CV builder document: {}", id);
        return CvFileResponse.builder()
                .id(cvFile.getId())
                .fileUrl(cvFile.getFileUrl())
                .fileName(cvFile.getFileName())
                .fileType(cvFile.getFileType())
                .fileSizeKb(cvFile.getFileSizeKb())
                .isPrimary(cvFile.isPrimary())
                .uploadedAt(cvFile.getUploadedAt())
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────

    private CandidateProfile getOrCreateProfile(UUID userId) {
        return profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User không tồn tại"));
                    return profileRepository.save(CandidateProfile.builder().user(user).build());
                });
    }

    private CvBuilderDocument findOwned(UUID userId, UUID id) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Chưa có hồ sơ ứng viên"));
        return documentRepository.findByIdAndCandidateId(id, profile.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy CV hoặc bạn không có quyền truy cập"));
    }

    private String blankToDefault(String title) {
        return (title == null || title.isBlank()) ? "CV của tôi" : title.trim();
    }

    private String toJson(CvBuilderContent content) {
        try {
            return objectMapper.writeValueAsString(content);
        } catch (Exception e) {
            throw new RuntimeException("Nội dung CV không hợp lệ: " + e.getMessage());
        }
    }

    private CvBuilderContent fromJson(String json) {
        try {
            return objectMapper.readValue(json, CvBuilderContent.class);
        } catch (Exception e) {
            throw new RuntimeException("Không đọc được nội dung CV: " + e.getMessage());
        }
    }

    private String sanitizeFileName(String title) {
        String base = (title == null || title.isBlank()) ? "CV" : title.trim();
        return base.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private String toPlainText(CvBuilderContent c) {
        StringBuilder sb = new StringBuilder();
        if (c.getPersonalInfo() != null) {
            var p = c.getPersonalInfo();
            sb.append(p.getFullName()).append("\n");
            if (p.getHeadline() != null) sb.append(p.getHeadline()).append("\n");
            if (p.getSummary() != null) sb.append(p.getSummary()).append("\n");
        }
        if (c.getExperiences() != null) {
            c.getExperiences().forEach(e -> sb.append(e.getPosition()).append(" - ")
                    .append(e.getCompany()).append(": ")
                    .append(e.getDescription() == null ? "" : e.getDescription()).append("\n"));
        }
        if (c.getEducations() != null) {
            c.getEducations().forEach(e -> sb.append(e.getSchool()).append(" - ")
                    .append(e.getDegree()).append(" ").append(e.getMajor()).append("\n"));
        }
        if (c.getSkills() != null) {
            sb.append("Ky nang: ").append(String.join(", ", c.getSkills())).append("\n");
        }
        if (c.getProjects() != null) {
            c.getProjects().forEach(p -> sb.append(p.getName()).append(": ")
                    .append(p.getDescription() == null ? "" : p.getDescription()).append("\n"));
        }
        return sb.toString();
    }

    private CvBuilderResponse mapToResponse(CvBuilderDocument document) {
        return CvBuilderResponse.builder()
                .id(document.getId())
                .title(document.getTitle())
                .template(document.getTemplate().name())
                .content(fromJson(document.getContent()))
                .exportedCvFileId(document.getExportedCvFile() != null ? document.getExportedCvFile().getId() : null)
                .exportedCvFileUrl(document.getExportedCvFile() != null ? document.getExportedCvFile().getFileUrl() : null)
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
