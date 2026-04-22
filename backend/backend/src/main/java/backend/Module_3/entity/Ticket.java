package backend.Module_3.entity;

import backend.Module_3.enums.TicketPriority;
import backend.Module_3.enums.TicketStatus;
import backend.Module_3.enums.UserRole;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "module3_tickets")
public class Ticket {

    @Id
    private String databaseId;

    @Indexed(unique = true)
    private String ticketCode;

    private String requesterId;

    private String requesterName;

    private UserRole requesterRole;

    private String resourceLocation;

    private String category;

    private TicketPriority priority;

    private TicketStatus status;

    private String description;

    private String preferredContact;

    private String assignedTechnicianId;

    private String assignedTechnicianName;

    private String resolutionNotes;

    private String rejectionReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<TicketAttachment> attachments = new ArrayList<>();

    private List<TicketComment> comments = new ArrayList<>();

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
