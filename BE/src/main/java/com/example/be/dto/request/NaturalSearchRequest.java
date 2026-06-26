package com.example.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NaturalSearchRequest {
    @NotBlank
    private String query;
}
