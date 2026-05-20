package com.example.be.service.inf;

import com.example.be.dto.request.CandidateProfileRequest;
import com.example.be.dto.response.CandidateProfileResponse;
import com.example.be.dto.response.CvFileResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CandidateProfileService {
    CandidateProfileResponse getProfile(UUID userId);
    CandidateProfileResponse createOrUpdate(UUID userId,
                                            CandidateProfileRequest request);
    CvFileResponse uploadCv(UUID userId, MultipartFile file);
    List<CvFileResponse> getMyCvFiles(UUID userId);
    void deleteCv(UUID userId, UUID cvFileId);
    CvFileResponse setPrimary(UUID userId, UUID cvFileId);
}