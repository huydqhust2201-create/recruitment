package com.example.be.entity;

import com.example.be.entity.enums.CvTemplate;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
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
@Table(name = "cv_builder_documents")
public class CvBuilderDocument {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @Builder.Default
    @Column(nullable = false)
    private String title = "CV của tôi";

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CvTemplate template = CvTemplate.MODERN;

    // Noi dung CV duoi dang JSON (xem CvBuilderContent) - tuong tu
    // cach CvParseResult.parsedSkills dang luu JSON nhu mot String.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exported_cv_file_id")
    private CvFile exportedCvFile;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
