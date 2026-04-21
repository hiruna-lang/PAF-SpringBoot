package backend.Module_3.dto;

import java.time.LocalDateTime;
import java.util.List;

import backend.Module_3.enums.TicketPriority;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.enums.UserRole;

public record TicketResponse(
        String databaseId,
        String id,
        String resource,
        String category,
        TicketPriority priority,
        TicketStatus status,
        String description,
        String preferredContact,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String assignedTechnicianId,
        String assignedTechnicianName,
        String requesterId,
        String requesterName,
        UserRole requesterRole,
        String resolutionNotes,
        String rejectionReason,
        List<AttachmentResponse> attachments,
        List<CommentResponse> comments,
        List<TimelineResponse> timeline) {
}
