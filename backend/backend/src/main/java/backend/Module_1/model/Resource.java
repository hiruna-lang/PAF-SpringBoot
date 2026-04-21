package backend.Module_1.model;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer capacity;
    private String location;
    private String availabilityWindow;

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @Enumerated(EnumType.STRING)
    private ResourceStatus status;

    public Resource() {
    }

    public Resource(Long id, String name, Integer capacity, String location, String availabilityWindow,
                    ResourceType type, ResourceStatus status) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.location = location;
        this.availabilityWindow = availabilityWindow;
        this.type = type;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public String getLocation() {
        return location;
    }

    public String getAvailabilityWindow() {
        return availabilityWindow;
    }

    public ResourceType getType() {
        return type;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setAvailabilityWindow(String availabilityWindow) {
        this.availabilityWindow = availabilityWindow;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}