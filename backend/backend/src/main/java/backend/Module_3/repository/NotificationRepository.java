package backend.Module_3.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.Module_3.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, String> {
}
