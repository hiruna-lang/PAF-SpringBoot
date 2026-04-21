package backend.Module_3.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "Comment message is required.")
        @Size(max = 500, message = "Comment must be 500 characters or fewer.")
        String message) {
}
