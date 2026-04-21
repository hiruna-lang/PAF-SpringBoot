package backend.Module_3.dto;

import java.time.LocalDateTime;

public record NotificationResponse(String id, String title, String message, boolean read, LocalDateTime createdAt) {
}
