package backend.Module_3.dto;

import backend.Module_3.enums.TicketStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateTicketStatusRequest(
        @NotNull(message = "Status is required.")
        TicketStatus status,
        @Size(max = 1000, message = "Resolution notes must be 1000 characters or fewer.")
        String resolutionNotes) {
}
