package backend.Module_3.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorResponse(String message, LocalDateTime timestamp, Map<String, String> fieldErrors) {

    public ApiErrorResponse(String message, LocalDateTime timestamp) {
        this(message, timestamp, Map.of());
    }
}
