package backend.Module_1.service.impl;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import backend.Module_1.exception.ResourceNotFoundException;
import backend.Module_1.model.Resource;
import backend.Module_1.repository.ResourceRepository;
import backend.Module_1.service.ResourceService;
import backend.Module_4.Notification.service.M4NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Autowired
    private M4NotificationService notificationService;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public Resource createResource(Resource resource) {
        Resource saved = resourceRepository.save(resource);
        // Notify ALL users — a new resource is available for booking
        try {
            String typeName = saved.getType() != null ? saved.getType().name() : "Resource";
            String location = saved.getLocation() != null ? saved.getLocation() : "campus";
            notificationService.notifyResourceCreated(saved.getName(), typeName, location);
        } catch (Exception ignored) {}
        return saved;
    }

    @Override
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Override
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @Override
    public Resource updateResource(String id, Resource resource) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(resource.getName());
        existingResource.setCapacity(resource.getCapacity());
        existingResource.setLocation(resource.getLocation());
        existingResource.setAvailabilityWindow(resource.getAvailabilityWindow());
        existingResource.setType(resource.getType());
        existingResource.setStatus(resource.getStatus());

        Resource saved = resourceRepository.save(existingResource);
        // Notify ALL users — resource details have changed
        try {
            String location = saved.getLocation() != null ? saved.getLocation() : "campus";
            notificationService.notifyResourceUpdated(saved.getName(), location);
        } catch (Exception ignored) {}
        return saved;
    }

    @Override
    public void deleteResource(String id) {
        Resource existingResource = getResourceById(id);
        String name = existingResource.getName();
        resourceRepository.delete(existingResource);
        // Notify ALL users — resource is no longer available
        try {
            notificationService.notifyResourceDeleted(name);
        } catch (Exception ignored) {}
    }

    @Override
    public List<Resource> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    @Override
    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCase(location);
    }

    @Override
    public List<Resource> getResourcesByMinCapacity(Integer capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity);
    }

    @Override
    public List<Resource> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }
}
