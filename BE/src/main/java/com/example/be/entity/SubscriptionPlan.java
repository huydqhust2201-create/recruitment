package com.example.be.entity;

import com.example.be.entity.enums.PlanCode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 20)
    private PlanCode code;

    @Column(nullable = false)
    private String name;

    @Column(name = "price_monthly", nullable = false)
    private Long priceMonthly;

    @Column(name = "max_jobs", nullable = false)
    private Integer maxJobs; // -1 = unlimited

    @Column(name = "ai_scoring", nullable = false)
    private boolean aiScoring;

    @Column(name = "ai_recommend", nullable = false)
    private boolean aiRecommend;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
