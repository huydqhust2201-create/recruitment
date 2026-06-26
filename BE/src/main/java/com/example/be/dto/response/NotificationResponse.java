package com.example.be.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class NotificationResponse {
    private UUID id;
    private String title;
    private String message;
    private String type;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
}
