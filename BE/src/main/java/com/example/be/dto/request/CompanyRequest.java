package com.example.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {

    @NotBlank(message = "TÃªn cÃ´ng ty khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String name;

    private String website;
    private String industry;
    private String companySize;
    private String description;
    private String city;
}
