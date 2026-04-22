package backend.Module_4.Notification.service;

import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.repository.UserRepository;
import backend.Module_4.Notification.dto.M4NotificationResponse;
import backend.Module_4.Notification.model.M4Notification;
import backend.Module_4.Notification.repository.M4NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class M4NotificationService {

    private final M4NotificationRepository repository;

    @Autowired
    private UserRepository userRepository;

    public M4NotificationService(M4NotificationRepository repository) {
        this.repository = repository;
    }

    // ── Read ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<M4NotificationResponse> getForUser(String email) {
        return repository.findAllByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnread(String email) {
        return repository.countByUserEmailAndReadFalse(email);
    }

    // ── Mark read ──────────────────────────────────────────

    public M4NotificationResponse markRead(String id, String email) {
        M4Notification n = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        n.setRead(true);
        return toResponse(repository.save(n));
    }

    public List<M4NotificationResponse> markAllRead(String email) {
        List<M4Notification> unread = repository
                .findAllByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .filter(n -> !n.isRead())
                .toList();
        unread.forEach(n -> n.setRead(true));
        repository.saveAll(unread);
        return getForUser(email);
    }

    // ── Core create ────────────────────────────────────────

    /**
     * Creates a notification for a specific user.
     *
     * @param email   recipient's email
     * @param title   short title
     * @param message full message body
     * @param type    semantic type: login | register | role_change | security | system
     *                               | booking | resource | ticket
     * @param source  originating module: M4 | M2 | M1 | M3
     */
    public void create(String email, String title, String message, String type, String source) {
        if (email == null || email.isBlank()) return;
        M4Notification n = new M4Notification();
        n.setId(UUID.randomUUID().toString());
        n.setUserEmail(email.trim().toLowerCase());
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setSource(source);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        repository.save(n);
    }

    /** Backward-compatible overload — defaults source to "M4" */
    public void create(String email, String title, String message, String type) {
        create(email, title, message, type, "M4");
    }

    // ── Broadcast helpers ──────────────────────────────────

    /** Sends a notification to every user with the given role. */
    private void notifyByRole(Role role, String title, String message, String type, String source) {
        try {
            userRepository.findByRole(role)
                    .forEach(u -> create(u.getEmail(), title, message, type, source));
        } catch (Exception ignored) {
            // Never let notification failures break the main operation
        }
    }

    /** Sends a notification to ALL registered users (every role). */
    private void notifyAllUsers(String title, String message, String type, String source) {
        try {
            userRepository.findAll()
                    .forEach(u -> create(u.getEmail(), title, message, type, source));
        } catch (Exception ignored) {
            // Never let notification failures break the main operation
        }
    }

    /** Sends to admins only. */
    private void notifyAdmins(String title, String message, String type, String source) {
        notifyByRole(Role.ADMIN, title, message, type, source);
    }

    // ── M4 Auth helpers ────────────────────────────────────

    public void notifyLogin(String email, String name) {
        create(email, "Sign-in successful",
                "Welcome back, " + name + "! You signed in to SmartCampus.",
                "login", "M4");
    }

    public void notifyRegister(String email, String name) {
        create(email, "Account created",
                "Welcome to SmartCampus, " + name + "! Your account is ready.",
                "register", "M4");
    }

    public void notifyRoleChange(String email, String newRole, String changedBy) {
        create(email, "Role updated",
                "Your role has been changed to " + newRole + " by " + changedBy + ".",
                "role_change", "M4");
    }

    public void notifyPhotoUpdate(String email) {
        create(email, "Profile photo updated",
                "Your profile photo was successfully saved.",
                "security", "M4");
    }

    // ── M2 Booking helpers ─────────────────────────────────

    /** Notifies the booking owner that their request is pending. Also alerts all admins. */
    public void notifyBookingCreated(String userEmail, String resourceName, String date) {
        // Notify the user
        create(userEmail, "Booking submitted",
                "Your booking for " + resourceName + " on " + date + " is pending approval.",
                "booking", "M2");
        // Notify all admins so they can act on it
        notifyAdmins(
                "New booking request",
                "A booking for " + resourceName + " on " + date + " is awaiting your approval.",
                "booking", "M2");
    }

    /** Notifies the booking owner that their booking was approved. */
    public void notifyBookingApproved(String userEmail, String resourceName, String date, String reason) {
        String msg = "Your booking for " + resourceName + " on " + date + " has been approved.";
        if (reason != null && !reason.isBlank()) msg += " Note: " + reason;
        create(userEmail, "Booking approved ✓", msg, "booking", "M2");
    }

    /** Notifies the booking owner that their booking was rejected. */
    public void notifyBookingRejected(String userEmail, String resourceName, String date, String reason) {
        String msg = "Your booking for " + resourceName + " on " + date + " was rejected.";
        if (reason != null && !reason.isBlank()) msg += " Reason: " + reason;
        create(userEmail, "Booking rejected", msg, "booking", "M2");
    }

    /** Notifies the booking owner that their booking was cancelled. */
    public void notifyBookingCancelled(String userEmail, String resourceName, String date) {
        create(userEmail, "Booking cancelled",
                "Your booking for " + resourceName + " on " + date + " has been cancelled.",
                "booking", "M2");
    }

    // ── M1 Resource helpers ────────────────────────────────

    /** Notifies ALL users that a new resource is available. */
    public void notifyResourceCreated(String resourceName, String type, String location) {
        notifyAllUsers(
                "New resource available 🏛️",
                "\"" + resourceName + "\" (" + type + ") at " + location + " is now available for booking.",
                "resource", "M1");
    }

    /** Notifies ALL users that a resource has been updated. */
    public void notifyResourceUpdated(String resourceName, String location) {
        notifyAllUsers(
                "Resource updated",
                "\"" + resourceName + "\" at " + location + " has been updated.",
                "resource", "M1");
    }

    /** Notifies ALL users that a resource has been removed. */
    public void notifyResourceDeleted(String resourceName) {
        notifyAllUsers(
                "Resource removed",
                "\"" + resourceName + "\" has been removed from the system.",
                "resource", "M1");
    }

    // ── M3 Ticket helpers ──────────────────────────────────

    /**
     * Notifies the ticket requester that their ticket was submitted.
     * Also notifies all admins that a new ticket needs attention.
     */
    public void notifyTicketCreated(String requesterEmail, String ticketCode, String location) {
        // Notify the requester
        if (requesterEmail != null) {
            create(requesterEmail, "Ticket submitted",
                    "Your ticket " + ticketCode + " for " + location + " has been submitted and is under review.",
                    "ticket", "M3");
        }
        // Notify all admins
        notifyAdmins(
                "New ticket opened",
                "Ticket " + ticketCode + " was submitted for " + location + " and needs review.",
                "ticket", "M3");
    }

    /**
     * Notifies the requester that their ticket status changed.
     * Also notifies admins on significant transitions.
     */
    public void notifyTicketStatusChanged(String requesterEmail, String ticketCode, String status) {
        if (requesterEmail != null) {
            create(requesterEmail, "Ticket status updated",
                    "Your ticket " + ticketCode + " has moved to " + status + ".",
                    "ticket", "M3");
        }
        // Notify admins when a ticket is resolved or closed
        if ("RESOLVED".equals(status) || "CLOSED".equals(status)) {
            notifyAdmins(
                    "Ticket " + status.toLowerCase(),
                    "Ticket " + ticketCode + " has been marked as " + status + ".",
                    "ticket", "M3");
        }
    }

    /**
     * Notifies the assigned technician about their new assignment.
     * Also notifies the ticket requester.
     */
    public void notifyTicketAssigned(String technicianEmail, String ticketCode, String technicianName,
                                     String requesterEmail) {
        // Notify the technician
        if (technicianEmail != null) {
            create(technicianEmail, "Ticket assigned to you",
                    "Ticket " + ticketCode + " has been assigned to you.",
                    "ticket", "M3");
        }
        // Notify the requester that someone is working on their ticket
        if (requesterEmail != null) {
            create(requesterEmail, "Technician assigned",
                    "Ticket " + ticketCode + " has been assigned to " + technicianName + ".",
                    "ticket", "M3");
        }
    }

    /** Backward-compatible overload without requesterEmail. */
    public void notifyTicketAssigned(String technicianEmail, String ticketCode, String technicianName) {
        notifyTicketAssigned(technicianEmail, ticketCode, technicianName, null);
    }

    /**
     * Notifies the requester that their ticket was rejected.
     * Also notifies admins.
     */
    public void notifyTicketRejected(String requesterEmail, String ticketCode, String reason) {
        if (requesterEmail != null) {
            create(requesterEmail, "Ticket rejected",
                    "Your ticket " + ticketCode + " was rejected. Reason: " + reason,
                    "ticket", "M3");
        }
        notifyAdmins(
                "Ticket rejected",
                "Ticket " + ticketCode + " was rejected. Reason: " + reason,
                "ticket", "M3");
    }

    // ── Mapping ────────────────────────────────────────────

    private M4NotificationResponse toResponse(M4Notification n) {
        return new M4NotificationResponse(
                n.getId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getSource(),
                n.isRead(),
                n.getCreatedAt());
    }
}
