package com.example.be.controller;

import com.example.be.dto.response.CompanySubscriptionResponse;
import com.example.be.dto.response.SubscriptionPlanResponse;
import com.example.be.entity.enums.PlanCode;
import com.example.be.repository.RecruiterProfileRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    @GetMapping("/api/subscriptions/plans")
    public ResponseEntity<List<SubscriptionPlanResponse>> getAllPlans() {
        return ResponseEntity.ok(subscriptionService.getAllPlans());
    }

    @GetMapping("/api/recruiter/subscription")
    public ResponseEntity<CompanySubscriptionResponse> getMySubscription(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID companyId = getCompanyId(userDetails);
        return ResponseEntity.ok(subscriptionService.getCurrentSubscription(companyId));
    }

    @PostMapping("/api/recruiter/subscription")
    public ResponseEntity<CompanySubscriptionResponse> subscribe(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID companyId = getCompanyId(userDetails);
        PlanCode planCode = PlanCode.valueOf(body.getOrDefault("planCode", "FREE"));
        String paymentRef = body.get("paymentRef");
        return ResponseEntity.ok(subscriptionService.subscribe(companyId, planCode, paymentRef));
    }

    private UUID getCompanyId(UserDetails userDetails) {
        UUID userId = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        return recruiterProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Recruiter profile not found"))
                .getCompany().getId();
    }
}
