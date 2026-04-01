package backend.Module_1.dto;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;

public class ResourceResponseDTO {

    private Long id;
    private String name;
    private Integer capacity;
    private String location;
    private String availabilityWindow;
    private ResourceType type;
    private ResourceStatus status;

    public ResourceResponseDTO() {
    }

    public ResourceResponseDTO(Long id, String name, Integer capacity, String location, String availabilityWindow, ResourceType type, ResourceStatus status) {
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

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvailabilityWindow() {
        return availabilityWindow;
    }

    public void setAvailabilityWindow(String availabilityWindow) {
        this.availabilityWindow = availabilityWindow;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }
}