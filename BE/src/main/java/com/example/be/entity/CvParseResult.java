package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "cv_parse_results")
public class CvParseResult {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_file_id", nullable = false, unique = true)
    private CvFile cvFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @Column(name = "raw_text", columnDefinition = "TEXT")
    private String rawText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_skills", columnDefinition = "jsonb")
    private String parsedSkills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_education", columnDefinition = "jsonb")
    private String parsedEducation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parsed_experience", columnDefinition = "jsonb")
    private String parsedExperience;

    @Column(name = "parse_confidence")
    private Double parseConfidence;

    @Column(name = "ai_model_used")
    private String aiModelUsed;

    @Column(name = "cv_embedding", columnDefinition = "vector(1536)")
    @JdbcTypeCode(SqlTypes.VECTOR)
    private float[] cvEmbedding;

    @CreationTimestamp
    @Column(name = "parsed_at", updatable = false)
    private OffsetDateTime parsedAt;
}
