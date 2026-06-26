package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class SubscriptionPlanResponse {
    private UUID id;
    private String code;
    private String name;
    private Long priceMonthly;
    private Integer maxJobs;
    private boolean aiScoring;
    private boolean aiRecommend;
    private String description;
}
