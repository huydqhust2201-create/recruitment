package com.example.be.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CandidateSearchRequest {
    private UUID jobId;
    private String skills;      // comma-separated or single keyword
    private String city;
    private Integer minExp;     // years min
    private Integer maxExp;     // years max
}
