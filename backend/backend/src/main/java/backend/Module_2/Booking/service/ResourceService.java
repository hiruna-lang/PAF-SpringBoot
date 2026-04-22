package backend.Module_2.Booking.service;

import backend.Module_2.Booking.dto.ResourceRequest;
import backend.Module_2.Booking.model.Resource;
import backend.Module_2.Booking.model.ResourceStatus;
import backend.Module_2.Booking.model.ResourceType;
import backend.Module_2.Booking.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * Full-featured search supporting keyword (name/location), type, status, minCapacity.
     * Falls back to findAll when all params are null.
     */
    public List<Resource> searchResources(String keyword, String type, String status, Integer minCapacity) {
        ResourceType rt = (type != null && !type.isBlank()) ? ResourceType.valueOf(type.toUpperCase()) : null;
        ResourceStatus rs = (status != null && !status.isBlank()) ? ResourceStatus.valueOf(status.toUpperCase()) : null;
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        // If nothing supplied, return all
        if (kw == null && rt == null && rs == null && minCapacity == null) {
            return resourceRepository.findAll();
        }
        return resourceRepository.search(kw, rt, rs, minCapacity);
    }

    public List<Resource> getAllResources(Boolean available, String type) {
        if (available != null && type != null) {
            return resourceRepository.findByAvailableAndType(available, ResourceType.valueOf(type.toUpperCase()));
        } else if (available != null) {
            return resourceRepository.findByAvailable(available);
        } else if (type != null) {
            return resourceRepository.findByType(ResourceType.valueOf(type.toUpperCase()));
        }
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
    }

    public Resource createResource(ResourceRequest req) {
        Resource r = new Resource();
        applyRequest(r, req);
        return resourceRepository.save(r);
    }

    public Resource updateResource(Long id, ResourceRequest req) {
        Resource r = resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        applyRequest(r, req);
        return resourceRepository.save(r);
    }

    public Resource setStatus(Long id, ResourceStatus newStatus) {
        Resource r = resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        r.setStatus(newStatus);
        return resourceRepository.save(r);
    }

    /** Legacy availability toggle — maps to ACTIVE / OUT_OF_SERVICE */
    public void setAvailability(Long id, boolean available) {
        Resource r = resourceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        r.setStatus(available ? ResourceStatus.ACTIVE : ResourceStatus.OUT_OF_SERVICE);
        resourceRepository.save(r);
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    private void applyRequest(Resource r, ResourceRequest req) {
        r.setName(req.getName());
        r.setType(req.getType());
        r.setLocation(req.getLocation());
        r.setCapacity(req.getCapacity());
        r.setDescription(req.getDescription());
        r.setAvailabilityNote(req.getAvailabilityNote());
        ResourceStatus st = req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE;
        r.setStatus(st);
    }
}
