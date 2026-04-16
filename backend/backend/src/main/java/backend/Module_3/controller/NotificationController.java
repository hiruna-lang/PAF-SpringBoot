package backend.Module_3.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.Module_3.dto.NotificationResponse;
import backend.Module_3.service.NotificationService;

@RestController
@RequestMapping("/api/module3/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getNotifications() {
        return notificationService.getNotifications();
    }

    @PatchMapping("/{notificationId}/read")
    public NotificationResponse markRead(@PathVariable String notificationId) {
        return notificationService.markAsRead(notificationId);
    }
}
