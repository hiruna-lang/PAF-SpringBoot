package backend.Module_1.model;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;
    private Integer capacity;
    private String location;
    private String availabilityWindow;

    private ResourceType type;

    private ResourceStatus status;

    public Resource() {
    }

    public Resource(String id, String name, Integer capacity, String location, String availabilityWindow,
                    ResourceType type, ResourceStatus status) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.location = location;
        this.availabilityWindow = availabilityWindow;
        this.type = type;
        this.status = status;
    }

    public String getId() {
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

    public void setId(String id) {
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