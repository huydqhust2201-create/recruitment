package com.example.be.controller;

import com.example.be.dto.request.CandidateProfileRequest;
import com.example.be.dto.response.CandidateProfileResponse;
import com.example.be.dto.response.CvFileResponse;
import com.example.be.entity.User;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.CandidateProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateProfileService profileService;
    private final UserRepository userRepository;

    // Xem hồ sơ
    @GetMapping("/profile")
    public ResponseEntity<CandidateProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                profileService.getProfile(getUserId(userDetails)));
    }

    // Tạo hoặc cập nhật hồ sơ
    @PutMapping("/profile")
    public ResponseEntity<CandidateProfileResponse> createOrUpdate(
            @RequestBody CandidateProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                profileService.createOrUpdate(
                        getUserId(userDetails), request));
    }

    // Upload CV — dùng multipart/form-data
    @PostMapping(value = "/cv/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CvFileResponse> uploadCv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                profileService.uploadCv(
                        getUserId(userDetails), file));
    }

    // Xem danh sách CV
    @GetMapping("/cv")
    public ResponseEntity<List<CvFileResponse>> getMyCvFiles(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                profileService.getMyCvFiles(getUserId(userDetails)));
    }

    // Xóa CV
    @DeleteMapping("/cv/{id}")
    public ResponseEntity<Void> deleteCv(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        profileService.deleteCv(getUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    // Đặt CV chính
    @PutMapping("/cv/{id}/primary")
    public ResponseEntity<CvFileResponse> setPrimary(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                profileService.setPrimary(getUserId(userDetails), id));
    }

    // Helper
    private UUID getUserId(UserDetails userDetails) {
        return userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException(
                        "User không tồn tại"))
                .getId();
    }
}