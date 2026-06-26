package com.example.be.service.impl;

import com.example.be.dto.response.CompanySubscriptionResponse;
import com.example.be.dto.response.SubscriptionPlanResponse;
import com.example.be.entity.Company;
import com.example.be.entity.CompanySubscription;
import com.example.be.entity.SubscriptionPlan;
import com.example.be.entity.enums.PlanCode;
import com.example.be.entity.enums.SubscriptionStatus;
import com.example.be.repository.CompanyRepository;
import com.example.be.repository.CompanySubscriptionRepository;
import com.example.be.repository.SubscriptionPlanRepository;
import com.example.be.service.inf.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionPlanRepository planRepository;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getAllPlans() {
        return planRepository.findAll().stream()
                .map(this::mapPlan)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompanySubscriptionResponse getCurrentSubscription(UUID companyId) {
        Optional<CompanySubscription> active = subscriptionRepository
                .findTopByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, SubscriptionStatus.ACTIVE);

        if (active.isPresent()) {
            return mapSubscription(active.get());
        }

        // Return FREE plan info without a record
        SubscriptionPlan freePlan = planRepository.findByCode(PlanCode.FREE)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói FREE"));
        return CompanySubscriptionResponse.builder()
                .plan(mapPlan(freePlan))
                .status("FREE")
                .jobsUsed(0)
                .jobsRemaining(freePlan.getMaxJobs())
                .build();
    }

    @Override
    public CompanySubscriptionResponse subscribe(UUID companyId, PlanCode planCode, String paymentRef) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công ty"));

        SubscriptionPlan plan = planRepository.findByCode(planCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy gói dịch vụ"));

        // Expire old active subscriptions
        subscriptionRepository.findTopByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, SubscriptionStatus.ACTIVE)
                .ifPresent(old -> {
                    old.setStatus(SubscriptionStatus.EXPIRED);
                    subscriptionRepository.save(old);
                });

        LocalDateTime now = LocalDateTime.now();
        CompanySubscription sub = CompanySubscription.builder()
                .company(company)
                .plan(plan)
                .status(SubscriptionStatus.ACTIVE)
                .startedAt(now)
                .expiresAt(planCode == PlanCode.FREE ? null : now.plusMonths(1))
                .jobsUsed(0)
                .paymentRef(paymentRef)
                .build();

        subscriptionRepository.save(sub);
        return mapSubscription(sub);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canCreateJob(UUID companyId) {
        Optional<CompanySubscription> active = subscriptionRepository
                .findTopByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, SubscriptionStatus.ACTIVE);

        if (active.isEmpty()) {
            // Default to FREE plan limits
            SubscriptionPlan freePlan = planRepository.findByCode(PlanCode.FREE).orElse(null);
            return freePlan != null && freePlan.getMaxJobs() > 0;
        }

        CompanySubscription sub = active.get();
        int maxJobs = sub.getPlan().getMaxJobs();
        return maxJobs == -1 || sub.getJobsUsed() < maxJobs;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAiScoring(UUID companyId) {
        return getActivePlan(companyId).map(SubscriptionPlan::isAiScoring).orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAiRecommend(UUID companyId) {
        return getActivePlan(companyId).map(SubscriptionPlan::isAiRecommend).orElse(false);
    }

    @Override
    public void incrementJobsUsed(UUID companyId) {
        subscriptionRepository.findTopByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, SubscriptionStatus.ACTIVE)
                .ifPresent(sub -> {
                    sub.setJobsUsed(sub.getJobsUsed() + 1);
                    subscriptionRepository.save(sub);
                });
    }

    private Optional<SubscriptionPlan> getActivePlan(UUID companyId) {
        return subscriptionRepository
                .findTopByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, SubscriptionStatus.ACTIVE)
                .map(CompanySubscription::getPlan);
    }

    private SubscriptionPlanResponse mapPlan(SubscriptionPlan p) {
        return SubscriptionPlanResponse.builder()
                .id(p.getId())
                .code(p.getCode().name())
                .name(p.getName())
                .priceMonthly(p.getPriceMonthly())
                .maxJobs(p.getMaxJobs())
                .aiScoring(p.isAiScoring())
                .aiRecommend(p.isAiRecommend())
                .description(p.getDescription())
                .build();
    }

    private CompanySubscriptionResponse mapSubscription(CompanySubscription sub) {
        SubscriptionPlan plan = sub.getPlan();
        int maxJobs = plan.getMaxJobs();
        int remaining = maxJobs == -1 ? -1 : Math.max(0, maxJobs - sub.getJobsUsed());

        return CompanySubscriptionResponse.builder()
                .id(sub.getId())
                .plan(mapPlan(plan))
                .status(sub.getStatus().name())
                .startedAt(sub.getStartedAt())
                .expiresAt(sub.getExpiresAt())
                .jobsUsed(sub.getJobsUsed())
                .jobsRemaining(remaining)
                .build();
    }
}
