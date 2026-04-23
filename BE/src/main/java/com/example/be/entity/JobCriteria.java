package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "job_criteria")
public class JobCriteria {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    // 1-1 vá»›i jobs
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false, unique = true)
    private Job job;

    // 3 trá»ng sá»‘ â€” tá»•ng pháº£i = 100
    @Column(name = "skill_weight", nullable = false)
    private int skillWeight = 40;

    @Column(name = "experience_weight", nullable = false)
    private int experienceWeight = 35;

    @Column(name = "education_weight", nullable = false)
    private int educationWeight = 25;

    // NgÆ°á»¡ng pass â€” 0.0 Ä‘áº¿n 1.0
    // vÃ­ dá»¥ 0.70 = pháº£i Ä‘áº¡t 70 Ä‘iá»ƒm má»›i qua
    @Column(name = "pass_threshold", nullable = false)
    private double passThreshold = 0.70;

    // HÆ°á»›ng dáº«n thÃªm cho AI khi cháº¥m
    @Column(name = "custom_instructions", columnDefinition = "TEXT")
    private String customInstructions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
