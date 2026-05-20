package com.example.be.service.impl;

import com.example.be.dto.request.CandidateProfileRequest;
import com.example.be.dto.response.CandidateProfileResponse;
import com.example.be.dto.response.CvFileResponse;
import com.example.be.entity.CandidateProfile;
import com.example.be.entity.CvFile;
import com.example.be.entity.User;
import com.example.be.repository.CandidateProfileRepository;
import com.example.be.repository.CvFileRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.CandidateProfileService;
import com.example.be.service.inf.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final CvFileRepository cvFileRepository;
    private final UserRepository userRepository;
    private final MinioService minioService;

    // Các định dạng file được phép
    private static final List<String> ALLOWED_TYPES =
            Arrays.asList("pdf", "doc", "docx");
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    // ── GET PROFILE ──────────────────────────────────────────
    @Override
    public CandidateProfileResponse getProfile(UUID userId) {
        CandidateProfile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Chưa có hồ sơ, vui lòng cập nhật"));
        return mapToResponse(profile);
    }

    // ── CREATE OR UPDATE PROFILE ─────────────────────────────
    @Override
    public CandidateProfileResponse createOrUpdate(
            UUID userId, CandidateProfileRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException(
                        "User không tồn tại"));

        // Tìm profile cũ hoặc tạo mới
        CandidateProfile profile = profileRepository
                .findByUserId(userId)
                .orElse(CandidateProfile.builder()
                        .user(user)
                        .build());

        // Cập nhật thông tin
        profile.setHeadline(request.getHeadline());
        profile.setCurrentPosition(request.getCurrentPosition());
        profile.setCurrentCompany(request.getCurrentCompany());
        profile.setBio(request.getBio());
        profile.setYearsOfExperience(request.getYearsOfExperience());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setCity(request.getCity());
        profile.setAddress(request.getAddress());
        profile.setCareerGoals(request.getCareerGoals());

        // Tính % hoàn thiện hồ sơ
        profile.setProfileCompleteness(
                calculateCompleteness(profile));

        profileRepository.save(profile);
        log.info("Đã cập nhật profile cho user: {}", userId);
        return mapToResponse(profile);
    }

    // ── UPLOAD CV ────────────────────────────────────────────
    @Override
    public CvFileResponse uploadCv(UUID userId, MultipartFile file) {

        // 1. Kiểm tra đã có profile chưa
        CandidateProfile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Vui lòng cập nhật hồ sơ trước khi upload CV"));

        // 2. Validate file
        validateFile(file);

        // 3. Upload lên MinIO
        String fileUrl = minioService.uploadFile(file, "cv/" + userId);

        // 4. Xác định đây có phải CV đầu tiên không
        boolean isFirst = cvFileRepository
                .countByCandidateId(profile.getId()) == 0;

        // 5. Lưu vào DB
        String extension = getExtension(file.getOriginalFilename());
        CvFile cvFile = CvFile.builder()
                .candidate(profile)
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .fileType(extension.toUpperCase())
                .fileSizeKb((int) (file.getSize() / 1024))
                .isPrimary(isFirst) // CV đầu tiên tự động là primary
                .build();

        cvFileRepository.save(cvFile);
        log.info("Upload CV thành công cho user: {}", userId);
        return mapCvToResponse(cvFile);
    }

    // ── GET MY CV FILES ──────────────────────────────────────
    @Override
    public List<CvFileResponse> getMyCvFiles(UUID userId) {
        CandidateProfile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Chưa có hồ sơ"));
        return cvFileRepository
                .findByCandidateId(profile.getId())
                .stream()
                .map(this::mapCvToResponse)
                .collect(Collectors.toList());
    }

    // ── DELETE CV ────────────────────────────────────────────
    @Override
    public void deleteCv(UUID userId, UUID cvFileId) {
        CvFile cvFile = cvFileRepository.findById(cvFileId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy CV"));

        // Kiểm tra CV này có thuộc về user không
        if (!cvFile.getCandidate().getUser()
                .getId().equals(userId)) {
            throw new RuntimeException(
                    "Bạn không có quyền xóa CV này");
        }

        // Xóa file khỏi MinIO
        minioService.deleteFile(cvFile.getFileUrl());

        // Xóa khỏi DB
        cvFileRepository.delete(cvFile);
        log.info("Đã xóa CV: {}", cvFileId);
    }

    // ── SET PRIMARY ──────────────────────────────────────────
    @Override
    public CvFileResponse setPrimary(UUID userId, UUID cvFileId) {
        CandidateProfile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Chưa có hồ sơ"));

        // Bỏ primary của tất cả CV cũ
        List<CvFile> allCvs = cvFileRepository
                .findByCandidateId(profile.getId());
        allCvs.forEach(cv -> cv.setPrimary(false));
        cvFileRepository.saveAll(allCvs);

        // Set primary cho CV được chọn
        CvFile target = cvFileRepository.findById(cvFileId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy CV"));
        target.setPrimary(true);
        cvFileRepository.save(target);
        return mapCvToResponse(target);
    }

    // ── Private helpers ──────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException(
                    "File quá lớn, tối đa 5MB");
        }
        String ext = getExtension(
                file.getOriginalFilename()).toLowerCase();
        if (!ALLOWED_TYPES.contains(ext)) {
            throw new RuntimeException(
                    "Chỉ chấp nhận file PDF, DOC, DOCX");
        }
    }

    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains("."))
            return "pdf";
        return fileName.substring(
                fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    // Tính % hoàn thiện hồ sơ
    private int calculateCompleteness(CandidateProfile p) {
        int score = 0;
        if (p.getHeadline() != null)         score += 15;
        if (p.getBio() != null)              score += 15;
        if (p.getCurrentPosition() != null)  score += 10;
        if (p.getCity() != null)             score += 10;
        if (p.getYearsOfExperience() != null)score += 10;
        if (p.getDateOfBirth() != null)      score += 10;
        if (p.getGender() != null)           score += 10;
        if (p.getCareerGoals() != null)      score += 10;
        if (p.getCvEmbedding() != null)      score += 10;
        return Math.min(score, 100);
    }

    private CandidateProfileResponse mapToResponse(
            CandidateProfile p) {
        return CandidateProfileResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .headline(p.getHeadline())
                .currentPosition(p.getCurrentPosition())
                .currentCompany(p.getCurrentCompany())
                .bio(p.getBio())
                .yearsOfExperience(p.getYearsOfExperience())
                .gender(p.getGender() != null
                        ? p.getGender().name() : null)
                .dateOfBirth(p.getDateOfBirth())
                .city(p.getCity())
                .address(p.getAddress())
                .careerGoals(p.getCareerGoals())
                .profileCompleteness(p.getProfileCompleteness())
                .hasCvEmbedding(p.getCvEmbedding() != null)
                .lastActive(p.getLastActive())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private CvFileResponse mapCvToResponse(CvFile cv) {
        return CvFileResponse.builder()
                .id(cv.getId())
                .fileUrl(cv.getFileUrl())
                .fileName(cv.getFileName())
                .fileType(cv.getFileType())
                .fileSizeKb(cv.getFileSizeKb())
                .isPrimary(cv.isPrimary())
                .uploadedAt(cv.getUploadedAt())
                .build();
    }
}