package backend.Module_4.Notification.repository;

import backend.Module_4.Notification.model.M4Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface M4NotificationRepository extends MongoRepository<M4Notification, String> {

    /** All notifications for a user, newest first */
    List<M4Notification> findAllByUserEmailOrderByCreatedAtDesc(String userEmail);

    /** Count unread notifications for a user */
    long countByUserEmailAndReadFalse(String userEmail);
}
