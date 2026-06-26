package com.example.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {

    @NotBlank(message = "Tên công ty không được để trống")
    private String name;

    private String website;
    private String industry;
    private String companySize;
    private String description;
    private String city;
}
