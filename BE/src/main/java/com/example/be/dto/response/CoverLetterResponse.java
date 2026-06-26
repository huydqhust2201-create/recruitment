package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CoverLetterResponse {
    private String content;
    private String jobTitle;
    private String companyName;
}
