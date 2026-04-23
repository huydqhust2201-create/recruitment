package com.example.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CompanyResponse {
    private UUID id;
    private String name;
    private String slug;
    private String logoUrl;
    private String website;
    private String industry;
    private String companySize;
    private String description;
    private String city;
    private boolean isVerified;
}
