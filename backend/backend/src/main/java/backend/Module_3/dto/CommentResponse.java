package backend.Module_3.dto;

import java.time.LocalDateTime;

import backend.Module_3.enums.UserRole;

public record CommentResponse(
        String id,
        String authorId,
        String authorName,
        UserRole authorRole,
        String message,
        LocalDateTime createdAt,
        LocalDateTime editedAt) {
}
