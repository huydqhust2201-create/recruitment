package com.example.be.service.inf;

import com.example.be.dto.response.NotificationResponse;
import com.example.be.entity.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    void create(UUID userId, String title, String message, NotificationType type, String link);
    List<NotificationResponse> getMyNotifications(UUID userId);
    long countUnread(UUID userId);
    void markRead(UUID notificationId, UUID userId);
    void markAllRead(UUID userId);
}
