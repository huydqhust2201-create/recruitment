package com.example.be.dto.response;

import com.example.be.dto.cvbuilder.CvBuilderContent;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class CvBuilderResponse {
    private UUID id;
    private String title;
    private String template;
    private CvBuilderContent content;
    private UUID exportedCvFileId;
    private String exportedCvFileUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
