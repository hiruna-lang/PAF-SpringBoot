package backend.Module_3.dto;

import java.time.LocalDateTime;

import backend.Module_3.enums.TicketStatus;

public record TimelineResponse(TicketStatus status, LocalDateTime createdAt, String note) {
}
