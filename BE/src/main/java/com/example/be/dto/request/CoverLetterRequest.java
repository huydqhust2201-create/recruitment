package com.example.be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CoverLetterRequest {
    @NotNull
    private UUID jobId;
}
