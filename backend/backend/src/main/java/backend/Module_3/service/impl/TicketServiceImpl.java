package backend.Module_3.service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import backend.Module_3.dto.AssignTechnicianRequest;
import backend.Module_3.dto.AttachmentResponse;
import backend.Module_3.dto.CommentRequest;
import backend.Module_3.dto.CommentResponse;
import backend.Module_3.dto.RejectTicketRequest;
import backend.Module_3.dto.TicketCreateRequest;
import backend.Module_3.dto.TicketResponse;
import backend.Module_3.dto.TimelineResponse;
import backend.Module_3.dto.UpdateTicketStatusRequest;
import backend.Module_3.entity.Technician;
import backend.Module_3.entity.Ticket;
import backend.Module_3.entity.TicketAttachment;
import backend.Module_3.entity.TicketComment;
import backend.Module_3.entity.TicketTimelineEntry;
import backend.Module_3.enums.TicketPriority;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.enums.UserRole;
import backend.Module_3.exception.BadRequestException;
import backend.Module_3.exception.ForbiddenOperationException;
import backend.Module_3.exception.ResourceNotFoundException;
import backend.Module_3.repository.TicketRepository;
import backend.Module_3.service.FileStorageService;
import backend.Module_3.service.NotificationService;
import backend.Module_3.service.TechnicianService;
import backend.Module_3.service.TicketService;
import backend.Module_3.support.ActorContext;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TechnicianService technicianService;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            TechnicianService technicianService,
            NotificationService notificationService,
            FileStorageService fileStorageService) {
        this.ticketRepository = ticketRepository;
        this.technicianService = technicianService;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTickets(
            ActorContext actor,
            TicketStatus status,
            TicketPriority priority,
            String category,
            String assignedTechnician,
            String search) {
        return visibleTickets(actor).stream()
                .filter(ticket -> status == null || ticket.getStatus() == status)
                .filter(ticket -> priority == null || ticket.getPriority() == priority)
                .filter(ticket -> !StringUtils.hasText(category) || ticket.getCategory().equalsIgnoreCase(category))
                .filter(ticket -> filterByAssignedTechnician(ticket, assignedTechnician))
                .filter(ticket -> matchesSearch(ticket, search))
                .sorted(Comparator.comparing(Ticket::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketByCode(String ticketCode, ActorContext actor) {
        Ticket ticket = loadTicket(ticketCode);
        ensureVisible(ticket, actor);
        return toResponse(ticket);
    }

    @Override
    public TicketResponse createTicket(TicketCreateRequest request, ActorContext actor) {
        if (actor.role() == UserRole.TECHNICIAN) {
            throw new ForbiddenOperationException("Technicians cannot create tickets");
        }

        if (request.getAttachments() != null && request.getAttachments().size() > 3) {
            throw new BadRequestException("Only 3 attachments are allowed");
        }

        LocalDateTime now = LocalDateTime.now();
        Ticket ticket = new Ticket();
        ticket.setDatabaseId(UUID.randomUUID().toString());
        ticket.setTicketCode(generateTicketCode());
        ticket.setRequesterId(actor.userId());
        ticket.setRequesterName(actor.userName());
        ticket.setRequesterRole(actor.role());
        ticket.setResourceLocation(normalize(request.getResource()));
        ticket.setCategory(normalize(request.getCategory()));
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setDescription(normalize(request.getDescription()));
        ticket.setPreferredContact(normalize(request.getPreferredContact()));
        ticket.setCreatedAt(now);
        ticket.setUpdatedAt(now);

        fileStorageService.storeAttachments(request.getAttachments()).forEach(ticket::addAttachment);
        ticket.addTimelineEntry(buildTimelineEntry(TicketStatus.OPEN, "Ticket submitted from Smart Campus Operations Hub.", now));

        Ticket saved = ticketRepository.save(ticket);
        notificationService.createNotification(
                "New ticket created",
                saved.getTicketCode() + " was submitted for " + saved.getResourceLocation() + ".");
        return toResponse(saved);
    }

    @Override
    public TicketResponse assignTechnician(String ticketCode, AssignTechnicianRequest request, ActorContext actor) {
        enforceAdmin(actor);
        Ticket ticket = loadTicket(ticketCode);
        String technicianId = request.technicianId();

        if (!StringUtils.hasText(technicianId)) {
            ticket.setAssignedTechnicianId(null);
            ticket.setAssignedTechnicianName(null);
            ticket.setUpdatedAt(LocalDateTime.now());
            ticket.addTimelineEntry(buildTimelineEntry(ticket.getStatus(), "Technician assignment cleared.", LocalDateTime.now()));
            notificationService.createNotification("Technician assignment updated", ticket.getTicketCode() + " was unassigned.");
            return toResponse(ticketRepository.save(ticket));
        }

        Technician technician = technicianService.getActiveTechnician(technicianId);
        ticket.setAssignedTechnicianId(technician.getId());
        ticket.setAssignedTechnicianName(technician.getName());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.addTimelineEntry(buildTimelineEntry(ticket.getStatus(), "Assigned to " + technician.getName() + ".", LocalDateTime.now()));

        Ticket saved = ticketRepository.save(ticket);
        notificationService.createNotification(
                "Technician assignment updated",
                saved.getTicketCode() + " assigned to " + technician.getName() + ".");
        return toResponse(saved);
    }

    @Override
    public TicketResponse updateTicketStatus(String ticketCode, UpdateTicketStatusRequest request, ActorContext actor) {
        Ticket ticket = loadTicket(ticketCode);
        enforceStatusPermission(ticket, actor);

        if (!allowedTransitions(ticket.getStatus()).contains(request.status())) {
            throw new BadRequestException("Cannot move ticket from " + ticket.getStatus() + " to " + request.status());
        }

        if (request.status() == TicketStatus.RESOLVED && !StringUtils.hasText(request.resolutionNotes())) {
            throw new BadRequestException("Resolution notes are required before marking a ticket as resolved");
        }

        ticket.setStatus(request.status());
        if (request.status() == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(normalize(request.resolutionNotes()));
        }
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.addTimelineEntry(buildTimelineEntry(request.status(), buildStatusNote(request), LocalDateTime.now()));

        Ticket saved = ticketRepository.save(ticket);
        notificationService.createNotification(
                "Ticket status updated",
                saved.getTicketCode() + " moved to " + saved.getStatus() + ".");
        return toResponse(saved);
    }

    @Override
    public TicketResponse rejectTicket(String ticketCode, RejectTicketRequest request, ActorContext actor) {
        enforceAdmin(actor);
        Ticket ticket = loadTicket(ticketCode);

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("This ticket cannot be rejected in its current state");
        }

        LocalDateTime now = LocalDateTime.now();
        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setRejectionReason(normalize(request.reason()));
        ticket.setUpdatedAt(now);
        ticket.addTimelineEntry(buildTimelineEntry(TicketStatus.REJECTED, normalize(request.reason()), now));

        Ticket saved = ticketRepository.save(ticket);
        notificationService.createNotification(
                "Ticket rejected",
                saved.getTicketCode() + " was rejected. Reason: " + normalize(request.reason()));
        return toResponse(saved);
    }

    @Override
    public TicketResponse addComment(String ticketCode, CommentRequest request, ActorContext actor) {
        Ticket ticket = loadTicket(ticketCode);
        ensureVisible(ticket, actor);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Closed tickets do not allow new comments");
        }

        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setAuthorId(actor.userId());
        comment.setAuthorName(actor.userName());
        comment.setAuthorRole(actor.role());
        comment.setMessage(normalize(request.message()));
        comment.setCreatedAt(LocalDateTime.now());
        ticket.addComment(comment);
        ticket.setUpdatedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    @Override
    public TicketResponse updateComment(String ticketCode, String commentId, CommentRequest request, ActorContext actor) {
        Ticket ticket = loadTicket(ticketCode);
        ensureVisible(ticket, actor);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Closed tickets do not allow comment editing");
        }

        TicketComment comment = ticket.getComments().stream()
                .filter(item -> commentId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthorId().equals(actor.userId())) {
            throw new ForbiddenOperationException("You can only edit your own comments");
        }

        comment.setMessage(normalize(request.message()));
        comment.setUpdatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public void deleteComment(String ticketCode, String commentId, ActorContext actor) {
        Ticket ticket = loadTicket(ticketCode);
        ensureVisible(ticket, actor);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BadRequestException("Closed tickets do not allow comment deletion");
        }

        TicketComment comment = ticket.getComments().stream()
                .filter(item -> commentId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getAuthorId().equals(actor.userId())) {
            throw new ForbiddenOperationException("You can only delete your own comments");
        }

        ticket.getComments().remove(comment);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    private List<Ticket> visibleTickets(ActorContext actor) {
        return switch (actor.role()) {
            case ADMIN -> ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
            case TECHNICIAN -> ticketRepository.findAllByAssignedTechnicianIdOrderByCreatedAtDesc(actor.userId());
            case USER -> ticketRepository.findAllByRequesterIdOrderByCreatedAtDesc(actor.userId());
        };
    }

    private boolean filterByAssignedTechnician(Ticket ticket, String assignedTechnician) {
        if (assignedTechnician == null || assignedTechnician.equalsIgnoreCase("ALL")) {
            return true;
        }
        if (assignedTechnician.isBlank()) {
            return !StringUtils.hasText(ticket.getAssignedTechnicianId());
        }
        return assignedTechnician.equals(ticket.getAssignedTechnicianId());
    }

    private boolean matchesSearch(Ticket ticket, String search) {
        if (!StringUtils.hasText(search)) {
            return true;
        }

        String query = search.toLowerCase(Locale.ROOT);
        String haystack = String.join(
                " ",
                ticket.getTicketCode(),
                ticket.getResourceLocation(),
                ticket.getCategory(),
                ticket.getRequesterName(),
                ticket.getAssignedTechnicianName() == null ? "" : ticket.getAssignedTechnicianName()).toLowerCase(Locale.ROOT);
        return haystack.contains(query);
    }

    private Ticket loadTicket(String ticketCode) {
        return ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    private void ensureVisible(Ticket ticket, ActorContext actor) {
        if (actor.role() == UserRole.ADMIN) {
            return;
        }
        if (actor.role() == UserRole.TECHNICIAN && actor.userId().equals(ticket.getAssignedTechnicianId())) {
            return;
        }
        if (actor.role() == UserRole.USER && actor.userId().equals(ticket.getRequesterId())) {
            return;
        }
        throw new ForbiddenOperationException("You do not have access to this ticket");
    }

    private void enforceAdmin(ActorContext actor) {
        if (actor.role() != UserRole.ADMIN) {
            throw new ForbiddenOperationException("Only admins can perform this action");
        }
    }

    private void enforceStatusPermission(Ticket ticket, ActorContext actor) {
        if (actor.role() == UserRole.ADMIN) {
            return;
        }
        if (actor.role() == UserRole.TECHNICIAN && actor.userId().equals(ticket.getAssignedTechnicianId())) {
            return;
        }
        throw new ForbiddenOperationException("You cannot update this ticket status");
    }

    private List<TicketStatus> allowedTransitions(TicketStatus currentStatus) {
        return switch (currentStatus) {
            case OPEN -> List.of(TicketStatus.IN_PROGRESS);
            case IN_PROGRESS -> List.of(TicketStatus.RESOLVED);
            case RESOLVED -> List.of(TicketStatus.CLOSED);
            case CLOSED, REJECTED -> List.of();
        };
    }

    private String buildStatusNote(UpdateTicketStatusRequest request) {
        if (request.status() == TicketStatus.RESOLVED) {
            return normalize(request.resolutionNotes());
        }
        return "Ticket status updated to " + request.status() + ".";
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private TicketTimelineEntry buildTimelineEntry(TicketStatus status, String note, LocalDateTime changedAt) {
        TicketTimelineEntry entry = new TicketTimelineEntry();
        entry.setId(UUID.randomUUID().toString());
        entry.setStatus(status);
        entry.setNote(note);
        entry.setChangedAt(changedAt);
        return entry;
    }

    private String generateTicketCode() {
        String candidate;
        do {
            candidate = "TCK-" + (1000 + (int) (Math.random() * 9000));
        } while (ticketRepository.findByTicketCode(candidate).isPresent());
        return candidate;
    }

    private TicketResponse toResponse(Ticket ticket) {
        List<AttachmentResponse> attachments = ticket.getAttachments().stream()
                .sorted(Comparator.comparing(TicketAttachment::getId))
                .map(attachment -> new AttachmentResponse(
                        attachment.getId(),
                        attachment.getOriginalFileName(),
                        attachment.getFileUrl(),
                        attachment.getContentType(),
                        attachment.getFileSize()))
                .toList();

        List<CommentResponse> comments = ticket.getComments().stream()
                .sorted(Comparator.comparing(TicketComment::getCreatedAt))
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getAuthorId(),
                        comment.getAuthorName(),
                        comment.getAuthorRole(),
                        comment.getMessage(),
                        comment.getCreatedAt(),
                        comment.getUpdatedAt()))
                .toList();

        List<TimelineResponse> timeline = ticket.getTimelineEntries().stream()
                .sorted(Comparator.comparing(TicketTimelineEntry::getChangedAt))
                .map(entry -> new TimelineResponse(entry.getStatus(), entry.getChangedAt(), entry.getNote()))
                .toList();

        return new TicketResponse(
                ticket.getDatabaseId(),
                ticket.getTicketCode(),
                ticket.getResourceLocation(),
                ticket.getCategory(),
                ticket.getPriority(),
                ticket.getStatus(),
                ticket.getDescription(),
                ticket.getPreferredContact(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getAssignedTechnicianId(),
                ticket.getAssignedTechnicianName(),
                ticket.getRequesterId(),
                ticket.getRequesterName(),
                ticket.getRequesterRole(),
                ticket.getResolutionNotes(),
                ticket.getRejectionReason(),
                attachments,
                comments,
                timeline);
    }
}
