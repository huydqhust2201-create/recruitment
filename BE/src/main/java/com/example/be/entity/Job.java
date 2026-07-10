package com.example.be.entity;

import com.example.be.entity.enums.JobStatus;
import com.example.be.entity.enums.JobType;
import com.example.be.entity.enums.JobLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY) // chá»‰ load khi sá»­ dá»¥ng Ä‘áº¿n
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "job")
    private JobCriteria criteria;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 20)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobLevel level;

    @Column(length = 100)
    private String industry; // ngÃ nh cÃ´ng nghiá»‡p

    @Column(length = 100)
    private String city;

    @Column(name = "salary_min")
    private Long salaryMin;

    @Column(name = "salary_max")
    private Long salaryMax;

    @Column(length = 10)
    private String currency = "VND";

    @Column(name = "is_salary_public", nullable = false)
    private boolean isSalaryPublic = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status = JobStatus.DRAFT;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Column(name = "apply_count", nullable = false)
    private int applyCount = 0;
    @Transient // vector(1536) — không map qua JDBC thường; dùng native query riêng
    private float[] jdEmbedding;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // Quan há»‡ vá»›i job_skills
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default // set up Ä‘á»ƒ cÃ³ object lÃ m viá»‡c
    private List<JobSkill> jobSkills = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
