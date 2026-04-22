package backend.Module_4.Notification.controller;

import backend.Module_4.Notification.dto.M4NotificationResponse;
import backend.Module_4.Notification.service.M4NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class M4NotificationController {

    private final M4NotificationService service;

    public M4NotificationController(M4NotificationService service) {
        this.service = service;
    }

    /**
     * GET /api/notifications
     * Returns all notifications for the authenticated user, newest first.
     */
    @GetMapping
    public ResponseEntity<List<M4NotificationResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(service.getForUser(auth.getName()));
    }

    /**
     * GET /api/notifications/unread-count
     * Returns the number of unread notifications for the authenticated user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication auth) {
        long count = service.countUnread(auth.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<M4NotificationResponse> markRead(
            @PathVariable String id,
            Authentication auth) {
        return ResponseEntity.ok(service.markRead(id, auth.getName()));
    }

    /**
     * PATCH /api/notifications/read-all
     * Marks all notifications for the authenticated user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<List<M4NotificationResponse>> markAllRead(Authentication auth) {
        return ResponseEntity.ok(service.markAllRead(auth.getName()));
    }
}
