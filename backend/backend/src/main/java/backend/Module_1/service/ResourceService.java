package backend.Module_1.service;

import backend.Module_1.model.Resource;

import java.util.List;

public interface ResourceService {
    Resource createResource(Resource resource);
    List<Resource> getAllResources();
    Resource getResourceById(Long id);
    Resource updateResource(Long id, Resource resource);
    void deleteResource(Long id);
}