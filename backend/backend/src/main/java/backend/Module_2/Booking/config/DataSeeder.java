package backend.Module_2.Booking.config;

import backend.Module_2.Booking.model.Resource;
import backend.Module_2.Booking.model.ResourceStatus;
import backend.Module_2.Booking.model.ResourceType;
import backend.Module_2.Booking.repository.ResourceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedResources(ResourceRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(r("Lecture Hall A",   ResourceType.ROOM,            "Block A, Floor 1",   120, "Large lecture hall with projector and PA system",         "Mon–Fri 08:00–20:00",              ResourceStatus.ACTIVE));
                repo.save(r("Lecture Hall B",   ResourceType.ROOM,            "Block A, Floor 2",    80, "Medium lecture hall with whiteboard",                     "Mon–Fri 08:00–20:00",              ResourceStatus.ACTIVE));
                repo.save(r("Seminar Room 101", ResourceType.ROOM,            "Block B, Floor 1",    30, "Small seminar room with round-table setup",               "Mon–Sat 07:00–22:00",              ResourceStatus.ACTIVE));
                repo.save(r("Seminar Room 102", ResourceType.ROOM,            "Block B, Floor 1",    30, "Small seminar room",                                      "Mon–Sat 07:00–22:00",              ResourceStatus.ACTIVE));
                repo.save(r("Boardroom",        ResourceType.ROOM,            "Admin Block, Floor 2", 12, "Executive boardroom with video-conferencing equipment",  "Mon–Fri 09:00–18:00",              ResourceStatus.ACTIVE));
                repo.save(r("Computer Lab 1",   ResourceType.LAB,             "Block C, Floor 1",    40, "PC lab – 40 workstations with internet access",           "Mon–Fri 08:00–20:00, Sat 08:00–14:00", ResourceStatus.ACTIVE));
                repo.save(r("Computer Lab 2",   ResourceType.LAB,             "Block C, Floor 2",    40, "PC lab – 40 workstations",                                "Mon–Fri 08:00–20:00",              ResourceStatus.ACTIVE));
                repo.save(r("Science Lab",      ResourceType.LAB,             "Block D, Floor 1",    25, "Wet chemistry lab – PPE required",                        "Mon–Fri 09:00–17:00",              ResourceStatus.ACTIVE));
                repo.save(r("Projector Unit 1", ResourceType.EQUIPMENT,       null,                  null, "Portable HD projector (HDMI/USB-C)",                   "Any time – book with a room",      ResourceStatus.ACTIVE));
                repo.save(r("Projector Unit 2", ResourceType.EQUIPMENT,       null,                  null, "Portable HD projector (HDMI/USB-C)",                   "Any time – book with a room",      ResourceStatus.ACTIVE));
                repo.save(r("Camera Set A",     ResourceType.EQUIPMENT,       null,                  null, "DSLR camera + tripod + lighting kit",                  "Mon–Fri 09:00–17:00",              ResourceStatus.ACTIVE));
                repo.save(r("Main Auditorium",  ResourceType.AUDITORIUM,      "Main Building",       500, "Full auditorium with stage, PA, and projection",         "By appointment (min 48 hrs notice)", ResourceStatus.ACTIVE));
                repo.save(r("Sports Hall",      ResourceType.SPORTS_FACILITY, "Sports Complex",      200, "Indoor multi-sport hall",                                "Mon–Sun 06:00–22:00",              ResourceStatus.ACTIVE));
                repo.save(r("Tennis Court 1",   ResourceType.SPORTS_FACILITY, "Sports Complex",        4, "Outdoor hard-court tennis court",                        "Mon–Sun 06:00–21:00",              ResourceStatus.ACTIVE));
                repo.save(r("Tennis Court 2",   ResourceType.SPORTS_FACILITY, "Sports Complex",        4, "Outdoor hard-court tennis court",                        "Mon–Sun 06:00–21:00",              ResourceStatus.OUT_OF_SERVICE));
                System.out.println("[M2] Seeded 15 sample resources.");
            }
        };
    }

    private Resource r(String name, ResourceType type, String location, Integer capacity,
                       String desc, String availNote, ResourceStatus status) {
        Resource res = new Resource();
        res.setName(name);
        res.setType(type);
        res.setLocation(location);
        res.setCapacity(capacity);
        res.setDescription(desc);
        res.setAvailabilityNote(availNote);
        res.setStatus(status);
        return res;
    }
}
