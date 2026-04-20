package backend.Module_1.service;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.enums.ResourceType;
import backend.Module_1.model.Resource;

import java.util.List;

public interface ResourceService {
    Resource createResource(Resource resource);
    List<Resource> getAllResources();
    Resource getResourceById(Long id);
    Resource updateResource(Long id, Resource resource);
    void deleteResource(Long id);

    List<Resource> getResourcesByType(ResourceType type);
    List<Resource> getResourcesByLocation(String location);
    List<Resource> getResourcesByMinCapacity(Integer capacity);
    List<Resource> getResourcesByStatus(ResourceStatus status);
}