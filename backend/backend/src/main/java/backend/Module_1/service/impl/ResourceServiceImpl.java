package backend.Module_1.service.impl;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import backend.Module_1.exception.ResourceNotFoundException;
import backend.Module_1.model.Resource;
import backend.Module_1.repository.ResourceRepository;
import backend.Module_1.service.ResourceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    @Override
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @Override
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @Override
    public Resource updateResource(Long id, Resource resource) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(resource.getName());
        existingResource.setCapacity(resource.getCapacity());
        existingResource.setLocation(resource.getLocation());
        existingResource.setAvailabilityWindow(resource.getAvailabilityWindow());
        existingResource.setType(resource.getType());
        existingResource.setStatus(resource.getStatus());

        return resourceRepository.save(existingResource);
    }

    @Override
    public void deleteResource(Long id) {
        Resource existingResource = getResourceById(id);
        resourceRepository.delete(existingResource);
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