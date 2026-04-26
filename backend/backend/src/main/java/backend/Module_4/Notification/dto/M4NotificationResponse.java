package backend.Module_4.Notification.dto;

import java.time.LocalDateTime;

public record M4NotificationResponse(
        String id,
        String title,
        String message,
        String type,
        String source,
        boolean read,
        LocalDateTime createdAt
) {}
