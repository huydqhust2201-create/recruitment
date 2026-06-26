package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class CompanySubscriptionResponse {
    private UUID id;
    private SubscriptionPlanResponse plan;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private int jobsUsed;
    private int jobsRemaining; // -1 = unlimited
}
