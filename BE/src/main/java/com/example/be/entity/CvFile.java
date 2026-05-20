package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cv_files")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvFile {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private CandidateProfile candidate;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;         // URL lưu trên MinIO

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;        // tên file gốc: "CV_NguyenVanA.pdf"

    @Column(name = "file_type", nullable = false, length = 10)
    private String fileType;        // PDF, DOCX, DOC

    @Column(name = "file_size_kb")
    private Integer fileSizeKb;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private boolean isPrimary = false;  // CV chính dùng để ứng tuyển

    @Column(name = "uploaded_at")
    private OffsetDateTime uploadedAt;

    @PrePersist
    public void prePersist() {
        this.uploadedAt = OffsetDateTime.now();
    }
}