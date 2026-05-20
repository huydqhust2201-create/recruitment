package com.example.be.entity;

import com.example.be.entity.enums.Gender;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ThÃ´ng tin nghá» nghiá»‡p
    private String headline;           // "Backend Developer 3 nÄƒm kinh nghiá»‡m"
    private String currentPosition;    // vá»‹ trÃ­ hiá»‡n táº¡i
    private String currentCompany;     // cÃ´ng ty hiá»‡n táº¡i

    @Column(columnDefinition = "TEXT")
    private String bio;                // giá»›i thiá»‡u báº£n thÃ¢n

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    // ThÃ´ng tin cÃ¡ nhÃ¢n
    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    private String city;
    private String address;

    @Column(name = "career_goals", columnDefinition = "TEXT")
    private String careerGoals;


    @Column(name = "profile_completeness")
    @Builder.Default
    private Integer profileCompleteness = 0;

    @Column(name = "cv_embedding", columnDefinition = "vector(1536)")
    @JdbcTypeCode(SqlTypes.VECTOR)
    private float[] cvEmbedding;

    @Column(name = "last_active")
    private OffsetDateTime lastActive;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.lastActive = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }
}
