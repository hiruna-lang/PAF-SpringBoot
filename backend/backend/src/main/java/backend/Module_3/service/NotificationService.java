package backend.Module_3.service;

import java.util.List;

import backend.Module_3.dto.NotificationResponse;

public interface NotificationService {
    List<NotificationResponse> getNotifications();
    NotificationResponse markAsRead(String id);
    void createNotification(String title, String message);
}
