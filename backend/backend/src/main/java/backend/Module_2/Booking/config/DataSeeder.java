package backend.Module_2.Booking.config;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import backend.Module_1.model.Resource;
import backend.Module_1.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedResources(ResourceRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(r("Lecture Hall A",   ResourceType.LECTURE_HALL, "Block A, Floor 1",   120, "Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE));
                repo.save(r("Lecture Hall B",   ResourceType.LECTURE_HALL, "Block A, Floor 2",    80, "Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE));
                repo.save(r("Seminar Room 101", ResourceType.MEETING_ROOM, "Block B, Floor 1",    30, "Mon-Sat 07:00-22:00", ResourceStatus.ACTIVE));
                repo.save(r("Seminar Room 102", ResourceType.MEETING_ROOM, "Block B, Floor 1",    30, "Mon-Sat 07:00-22:00", ResourceStatus.ACTIVE));
                repo.save(r("Boardroom",        ResourceType.MEETING_ROOM, "Admin Block, Floor 2", 12, "Mon-Fri 09:00-18:00", ResourceStatus.ACTIVE));
                repo.save(r("Computer Lab 1",   ResourceType.LAB,          "Block C, Floor 1",    40, "Mon-Fri 08:00-20:00, Sat 08:00-14:00", ResourceStatus.ACTIVE));
                repo.save(r("Computer Lab 2",   ResourceType.LAB,          "Block C, Floor 2",    40, "Mon-Fri 08:00-20:00", ResourceStatus.ACTIVE));
                repo.save(r("Science Lab",      ResourceType.LAB,          "Block D, Floor 1",    25, "Mon-Fri 09:00-17:00", ResourceStatus.ACTIVE));
                repo.save(r("Projector Unit 1", ResourceType.EQUIPMENT,    "Stores",              null, "Any time - book with a room", ResourceStatus.ACTIVE));
                repo.save(r("Projector Unit 2", ResourceType.EQUIPMENT,    "Stores",              null, "Any time - book with a room", ResourceStatus.ACTIVE));
                repo.save(r("Camera Set A",     ResourceType.EQUIPMENT,    "Media Center",        null, "Mon-Fri 09:00-17:00", ResourceStatus.ACTIVE));
                repo.save(r("Main Auditorium",  ResourceType.LECTURE_HALL, "Main Building",       500, "By appointment (min 48 hrs notice)", ResourceStatus.ACTIVE));
                repo.save(r("Sports Hall",      ResourceType.MEETING_ROOM, "Sports Complex",      200, "Mon-Sun 06:00-22:00", ResourceStatus.ACTIVE));
                repo.save(r("Tennis Court 1",   ResourceType.MEETING_ROOM, "Sports Complex",        4, "Mon-Sun 06:00-21:00", ResourceStatus.ACTIVE));
                repo.save(r("Tennis Court 2",   ResourceType.MEETING_ROOM, "Sports Complex",        4, "Mon-Sun 06:00-21:00", ResourceStatus.OUT_OF_SERVICE));
                System.out.println("[M2] Seeded 15 sample resources.");
            }
        };
    }

    private Resource r(String name, ResourceType type, String location, Integer capacity,
                       String availabilityWindow, ResourceStatus status) {
        Resource res = new Resource();
        res.setName(name);
        res.setType(type);
        res.setLocation(location);
        res.setCapacity(capacity);
        res.setAvailabilityWindow(availabilityWindow);
        res.setStatus(status);
        return res;
    }
}
