package com.example.be.dto.request;

import com.example.be.entity.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CandidateProfileRequest {
    private String headline;
    private String currentPosition;
    private String currentCompany;
    private String bio;
    private Integer yearsOfExperience;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String city;
    private String address;
    private String careerGoals;
}