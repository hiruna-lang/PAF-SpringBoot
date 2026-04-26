package backend.Module_3.service;

import java.util.List;

import backend.Module_3.dto.AssignTechnicianRequest;
import backend.Module_3.dto.CommentRequest;
import backend.Module_3.dto.RejectTicketRequest;
import backend.Module_3.dto.TicketCreateRequest;
import backend.Module_3.dto.TicketResponse;
import backend.Module_3.dto.UpdateTicketStatusRequest;
import backend.Module_3.enums.TicketPriority;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.support.ActorContext;

public interface TicketService {
    List<TicketResponse> getTickets(
            ActorContext actor,
            TicketStatus status,
            TicketPriority priority,
            String category,
            String assignedTechnician,
            String search);

    TicketResponse getTicketByCode(String ticketCode, ActorContext actor);

    TicketResponse createTicket(TicketCreateRequest request, ActorContext actor);

    TicketResponse assignTechnician(String ticketCode, AssignTechnicianRequest request, ActorContext actor);

    TicketResponse updateTicketStatus(String ticketCode, UpdateTicketStatusRequest request, ActorContext actor);

    TicketResponse rejectTicket(String ticketCode, RejectTicketRequest request, ActorContext actor);

    TicketResponse addComment(String ticketCode, CommentRequest request, ActorContext actor);

    TicketResponse updateComment(String ticketCode, String commentId, CommentRequest request, ActorContext actor);

    void deleteComment(String ticketCode, String commentId, ActorContext actor);
}
