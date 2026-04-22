package backend.Module_2.Booking.controller;

import backend.Module_2.Booking.dto.ResourceRequest;
import backend.Module_2.Booking.model.Resource;
import backend.Module_2.Booking.model.ResourceStatus;
import backend.Module_2.Booking.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/m2/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    /**
     * GET /api/m2/resources
     * Supports ?keyword=&type=&status=&minCapacity=
     * Any authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<Resource>> search(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Integer minCapacity
    ) {
        return ResponseEntity.ok(resourceService.searchResources(keyword, type, status, minCapacity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(resourceService.getResourceById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Admin: create a new resource */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody ResourceRequest req) {
        try {
            return ResponseEntity.status(201).body(resourceService.createResource(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Admin: update resource metadata */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ResourceRequest req) {
        try {
            return ResponseEntity.ok(resourceService.updateResource(id, req));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Admin: change resource status (ACTIVE | OUT_OF_SERVICE | MAINTENANCE)
     * PATCH /api/m2/resources/{id}/status
     * Body: { "status": "OUT_OF_SERVICE" }
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        try {
            ResourceStatus newStatus = ResourceStatus.valueOf(body.get("status").toUpperCase());
            return ResponseEntity.ok(resourceService.setStatus(id, newStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value"));
        }
    }

    /** Admin: legacy availability toggle (maps to ACTIVE/OUT_OF_SERVICE) */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> setAvailability(
        @PathVariable Long id,
        @RequestBody Map<String, Boolean> body
    ) {
        resourceService.setAvailability(id, body.get("available"));
        return ResponseEntity.noContent().build();
    }

    /** Admin: delete a resource */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
