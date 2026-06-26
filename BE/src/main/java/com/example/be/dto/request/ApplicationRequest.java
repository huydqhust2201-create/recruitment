package com.example.be.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ApplicationRequest {

    @NotNull(message = "jobId không được để trống")
    private UUID jobId;

    @NotNull(message = "cvFileId không được để trống")
    private UUID cvFileId;

    private String coverLetter;
}
