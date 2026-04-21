package backend.Module_3.config;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import backend.Module_3.entity.Notification;
import backend.Module_3.entity.Technician;
import backend.Module_3.repository.NotificationRepository;
import backend.Module_3.repository.TechnicianRepository;

@Configuration
public class Module3DataInitializer {

    @Bean
    CommandLineRunner seedModule3Data(TechnicianRepository technicianRepository, NotificationRepository notificationRepository) {
        return args -> {
            if (technicianRepository.count() == 0) {
                technicianRepository.saveAll(List.of(
                        buildTechnician("tech-300", "Ishan Silva", "Electrical", "+94 76 998 2211", "ishan.silva@campus.edu"),
                        buildTechnician("tech-301", "Madhavi Karunarathna", "Network", "+94 77 450 8821", "madhavi.k@campus.edu"),
                        buildTechnician("tech-302", "Ruwan Jayasekara", "Hardware", "+94 71 201 9945", "ruwan.j@campus.edu")));
            }

            if (notificationRepository.count() == 0) {
                Notification notification = new Notification();
                notification.setId(UUID.randomUUID().toString());
                notification.setTitle("Module ready");
                notification.setMessage("Maintenance and incident ticketing backend initialized.");
                notification.setRead(false);
                notification.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(notification);
            }
        };
    }

    private Technician buildTechnician(String id, String name, String specialization, String phone, String email) {
        Technician technician = new Technician();
        technician.setId(id);
        technician.setName(name);
        technician.setSpecialization(specialization);
        technician.setPhone(phone);
        technician.setEmail(email);
        technician.setActive(true);
        return technician;
    }
}
