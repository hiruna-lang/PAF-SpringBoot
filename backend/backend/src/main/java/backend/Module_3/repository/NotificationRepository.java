package backend.Module_3.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import backend.Module_3.entity.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
}
