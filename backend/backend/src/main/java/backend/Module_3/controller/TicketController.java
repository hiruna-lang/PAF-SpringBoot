package backend.Module_3.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import backend.Module_3.dto.AssignTechnicianRequest;
import backend.Module_3.dto.CommentRequest;
import backend.Module_3.dto.RejectTicketRequest;
import backend.Module_3.dto.TicketCreateRequest;
import backend.Module_3.dto.TicketResponse;
import backend.Module_3.dto.UpdateTicketStatusRequest;
import backend.Module_3.enums.TicketPriority;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.service.TicketService;
import backend.Module_3.support.ActorContextResolver;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/module3/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final ActorContextResolver actorContextResolver;

    public TicketController(TicketService ticketService, ActorContextResolver actorContextResolver) {
        this.ticketService = ticketService;
        this.actorContextResolver = actorContextResolver;
    }

    @GetMapping
    public List<TicketResponse> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedTechnician,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        return ticketService.getTickets(
                actorContextResolver.resolve(request),
                status,
                priority,
                category,
                assignedTechnician,
                search);
    }

    @GetMapping("/{ticketCode}")
    public TicketResponse getTicket(@PathVariable String ticketCode, HttpServletRequest request) {
        return ticketService.getTicketByCode(ticketCode, actorContextResolver.resolve(request));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(@Valid @ModelAttribute TicketCreateRequest request, HttpServletRequest servletRequest) {
        return ResponseEntity.ok(ticketService.createTicket(request, actorContextResolver.resolve(servletRequest)));
    }

    @PatchMapping("/{ticketCode}/assign")
    public TicketResponse assignTechnician(
            @PathVariable String ticketCode,
            @RequestBody AssignTechnicianRequest request,
            HttpServletRequest servletRequest) {
        return ticketService.assignTechnician(ticketCode, request, actorContextResolver.resolve(servletRequest));
    }

    @PatchMapping("/{ticketCode}/status")
    public TicketResponse updateStatus(
            @PathVariable String ticketCode,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            HttpServletRequest servletRequest) {
        return ticketService.updateTicketStatus(ticketCode, request, actorContextResolver.resolve(servletRequest));
    }

    @PatchMapping("/{ticketCode}/reject")
    public TicketResponse rejectTicket(
            @PathVariable String ticketCode,
            @Valid @RequestBody RejectTicketRequest request,
            HttpServletRequest servletRequest) {
        return ticketService.rejectTicket(ticketCode, request, actorContextResolver.resolve(servletRequest));
    }

    @PostMapping("/{ticketCode}/comments")
    public TicketResponse addComment(
            @PathVariable String ticketCode,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest servletRequest) {
        return ticketService.addComment(ticketCode, request, actorContextResolver.resolve(servletRequest));
    }

    @PatchMapping("/{ticketCode}/comments/{commentId}")
    public TicketResponse updateComment(
            @PathVariable String ticketCode,
            @PathVariable String commentId,
            @Valid @RequestBody CommentRequest request,
            HttpServletRequest servletRequest) {
        return ticketService.updateComment(ticketCode, commentId, request, actorContextResolver.resolve(servletRequest));
    }

    @DeleteMapping("/{ticketCode}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketCode,
            @PathVariable String commentId,
            HttpServletRequest servletRequest) {
        ticketService.deleteComment(ticketCode, commentId, actorContextResolver.resolve(servletRequest));
        return ResponseEntity.noContent().build();
    }
}
