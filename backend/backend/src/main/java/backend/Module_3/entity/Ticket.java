package backend.Module_3.entity;

import backend.Module_3.enums.TicketPriority;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.enums.UserRole;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "module3_tickets", uniqueConstraints = {
        @UniqueConstraint(name = "uk_module3_ticket_code", columnNames = "ticket_code")
})
public class Ticket {

    @Id
    @Column(name = "id")
    private String databaseId;

    @Column(name = "ticket_code", nullable = false, unique = true)
    private String ticketCode;

    private String requesterId;

    private String requesterName;

    @Enumerated(EnumType.STRING)
    private UserRole requesterRole;

    private String resourceLocation;

    private String category;

    @Enumerated(EnumType.STRING)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String preferredContact;

    private String assignedTechnicianId;

    private String assignedTechnicianName;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "module3_ticket_attachments", joinColumns = @JoinColumn(name = "ticket_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "attachment_id")),
            @AttributeOverride(name = "originalFileName", column = @Column(name = "original_file_name")),
            @AttributeOverride(name = "storedFileName", column = @Column(name = "stored_file_name")),
            @AttributeOverride(name = "contentType", column = @Column(name = "content_type")),
            @AttributeOverride(name = "fileSize", column = @Column(name = "file_size")),
            @AttributeOverride(name = "fileUrl", column = @Column(name = "file_url", length = 1024))
    })
    private List<TicketAttachment> attachments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "module3_ticket_comments", joinColumns = @JoinColumn(name = "ticket_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "comment_id")),
            @AttributeOverride(name = "authorId", column = @Column(name = "author_id")),
            @AttributeOverride(name = "authorName", column = @Column(name = "author_name")),
            @AttributeOverride(name = "authorRole", column = @Column(name = "author_role")),
            @AttributeOverride(name = "message", column = @Column(name = "message", columnDefinition = "TEXT")),
            @AttributeOverride(name = "createdAt", column = @Column(name = "created_at")),
            @AttributeOverride(name = "updatedAt", column = @Column(name = "updated_at"))
    })
    private List<TicketComment> comments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "module3_ticket_timeline", joinColumns = @JoinColumn(name = "ticket_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "id", column = @Column(name = "timeline_id")),
            @AttributeOverride(name = "status", column = @Column(name = "status")),
            @AttributeOverride(name = "note", column = @Column(name = "note", columnDefinition = "TEXT")),
            @AttributeOverride(name = "changedAt", column = @Column(name = "changed_at"))
    })
    private List<TicketTimelineEntry> timelineEntries = new ArrayList<>();

    public void addAttachment(TicketAttachment attachment) {
        this.attachments.add(attachment);
    }

    public void addComment(TicketComment comment) {
        this.comments.add(comment);
    }

    public void addTimelineEntry(TicketTimelineEntry timelineEntry) {
        this.timelineEntries.add(timelineEntry);
    }

    public String getDatabaseId() {
        return databaseId;
    }

    public void setDatabaseId(String databaseId) {
        this.databaseId = databaseId;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public UserRole getRequesterRole() {
        return requesterRole;
    }

    public void setRequesterRole(UserRole requesterRole) {
        this.requesterRole = requesterRole;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPreferredContact() {
        return preferredContact;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
    }

    public String getAssignedTechnicianId() {
        return assignedTechnicianId;
    }

    public void setAssignedTechnicianId(String assignedTechnicianId) {
        this.assignedTechnicianId = assignedTechnicianId;
    }

    public String getAssignedTechnicianName() {
        return assignedTechnicianName;
    }

    public void setAssignedTechnicianName(String assignedTechnicianName) {
        this.assignedTechnicianName = assignedTechnicianName;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<TicketAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<TicketAttachment> attachments) {
        this.attachments = attachments;
    }

    public List<TicketComment> getComments() {
        return comments;
    }

    public void setComments(List<TicketComment> comments) {
        this.comments = comments;
    }

    public List<TicketTimelineEntry> getTimelineEntries() {
        return timelineEntries;
    }

    public void setTimelineEntries(List<TicketTimelineEntry> timelineEntries) {
        this.timelineEntries = timelineEntries;
    }
}
