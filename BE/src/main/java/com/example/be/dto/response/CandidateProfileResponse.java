package com.example.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CandidateProfileResponse {
    private UUID id;
    private UUID userId;
    private String fullName;     // lấy từ users.full_name
    private String email;        // lấy từ users.email
    private String headline;
    private String currentPosition;
    private String currentCompany;
    private String bio;
    private Integer yearsOfExperience;
    private String gender;
    private LocalDate dateOfBirth;
    private String city;
    private String address;
    private String careerGoals;
    private Integer profileCompleteness;
    private boolean hasCvEmbedding;  // có vector chưa
    private OffsetDateTime lastActive;
    private OffsetDateTime updatedAt;
}