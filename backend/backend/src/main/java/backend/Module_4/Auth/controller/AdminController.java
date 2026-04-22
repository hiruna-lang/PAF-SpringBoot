package backend.Module_4.Auth.controller;

import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserService userService;

    /**
     * GET /api/admin/users
     * Returns all users — ADMIN only
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Body: { "role": "MANAGER" }
     * Change a user's role — ADMIN only
     */
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            org.springframework.security.core.Authentication auth) {

        Role newRole = Role.valueOf(body.get("role").toUpperCase());
        String adminEmail = auth != null ? auth.getName() : "an administrator";
        return ResponseEntity.ok(userService.updateRole(id, newRole, adminEmail));
    }

    /**
     * GET /api/admin/dashboard
     * Admin-only info endpoint
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminDashboard() {
        long total = userService.getAllUsers().size();
        return ResponseEntity.ok(Map.of(
                "totalUsers", total,
                "message", "Welcome to the Admin Dashboard"
        ));
    }

    /**
     * GET /api/manager/reports
     * MANAGER and ADMIN can access this
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, String>> managerReports() {
        return ResponseEntity.ok(Map.of("message", "Manager reports endpoint"));
    }
}
