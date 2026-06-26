package com.example.be.service.inf;

import com.example.be.dto.response.CompanySubscriptionResponse;
import com.example.be.dto.response.SubscriptionPlanResponse;
import com.example.be.entity.enums.PlanCode;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {
    List<SubscriptionPlanResponse> getAllPlans();
    CompanySubscriptionResponse getCurrentSubscription(UUID companyId);
    CompanySubscriptionResponse subscribe(UUID companyId, PlanCode planCode, String paymentRef);
    boolean canCreateJob(UUID companyId);
    boolean hasAiScoring(UUID companyId);
    boolean hasAiRecommend(UUID companyId);
    void incrementJobsUsed(UUID companyId);
}
