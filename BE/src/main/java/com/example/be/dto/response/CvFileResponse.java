package com.example.be.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CvFileResponse {
    private UUID id;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private Integer fileSizeKb;
    private boolean isPrimary;
    private OffsetDateTime uploadedAt;
}