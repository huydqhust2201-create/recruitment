package com.example.be.controller;

import com.example.be.dto.request.CvBuilderRequest;
import com.example.be.dto.response.CvBuilderResponse;
import com.example.be.dto.response.CvFileResponse;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.CvBuilderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/candidate/cv-builder")
@RequiredArgsConstructor
public class CvBuilderController {

    private final CvBuilderService cvBuilderService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CvBuilderResponse>> getMyDocuments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cvBuilderService.getMyDocuments(getUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CvBuilderResponse> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cvBuilderService.getById(getUserId(userDetails), id));
    }

    @PostMapping
    public ResponseEntity<CvBuilderResponse> create(
            @Valid @RequestBody CvBuilderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cvBuilderService.create(getUserId(userDetails), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CvBuilderResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody CvBuilderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cvBuilderService.update(getUserId(userDetails), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        cvBuilderService.delete(getUserId(userDetails), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<CvFileResponse> exportToPdf(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cvBuilderService.exportToPdf(getUserId(userDetails), id));
    }

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"))
                .getId();
    }
}
