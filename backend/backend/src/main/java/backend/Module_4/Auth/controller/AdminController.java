package backend.Module_4.Auth.controller;

import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
     * Returns all users — ADMIN only.
     * Each user object includes the role-prefixed id (USR-0001, ADM-0001, TCN-0001).
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Body: { "role": "TECHNICIAN" }
     * Change a user's role — ADMIN only.
     * The user's ID prefix is preserved (reflects role at creation time).
     */
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateRole(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            org.springframework.security.core.Authentication auth) {

        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "role field is required"));
        }

        Role newRole;
        try {
            newRole = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid role: " + roleStr));
        }

        String adminEmail = auth != null ? auth.getName() : "an administrator";
        return ResponseEntity.ok(userService.updateRole(id, newRole, adminEmail));
    }

    /**
     * GET /api/admin/dashboard
     * Summary stats — ADMIN only.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminDashboard() {
        List<User> users = userService.getAllUsers();
        long admins      = users.stream().filter(u -> u.getRole() == Role.ADMIN).count();
        long technicians = users.stream().filter(u -> u.getRole() == Role.TECHNICIAN).count();
        long regularUsers = users.stream().filter(u -> u.getRole() == Role.USER).count();

        return ResponseEntity.ok(Map.of(
                "totalUsers",  users.size(),
                "admins",      admins,
                "technicians", technicians,
                "users",       regularUsers,
                "message",     "Welcome to the Admin Dashboard"
        ));
    }

    /**
     * GET /api/admin/reports
     * ADMIN and TECHNICIAN can access this.
     */
    @GetMapping("/reports")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Map<String, String>> reports() {
        return ResponseEntity.ok(Map.of("message", "Reports endpoint"));
    }
}
