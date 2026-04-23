package com.example.be.controller;

import com.example.be.dto.request.CompanyRequest;
import com.example.be.dto.response.CompanyResponse;
import com.example.be.entity.User;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/recruiter/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<CompanyResponse> create(
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(companyService.create(request, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<CompanyResponse> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(companyService.getBySlug(slug));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(companyService.update(id, request, userId));
    }

    // Láº¥y UUID tá»« UserDetails Ä‘ang Ä‘Äƒng nháº­p
    private UUID getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"));
        return user.getId();
    }
}
