package backend.Module_4.Auth.controller;

import backend.Module_4.Auth.dto.AuthResponse;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    @Autowired
    private UserService userService;

    /** GET /api/profile/me — full profile from DB */
    @GetMapping("/me")
    public ResponseEntity<User> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    /**
     * PUT /api/profile/update
     * Body: { "name": "...", "phoneNumber": "..." }
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        String name  = body.get("name");
        String phone = body.get("phoneNumber");
        if (name != null && name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name cannot be empty"));
        }
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), name, phone));
    }

    /**
     * PUT /api/profile/photo
     * Body: { "photoUrl": "data:image/jpeg;base64,..." }
     */
    @PutMapping("/photo")
    public ResponseEntity<AuthResponse> updatePhoto(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        String photoUrl = body.get("photoUrl");
        if (photoUrl == null || photoUrl.isBlank()) return ResponseEntity.badRequest().build();
        if (photoUrl.length() > 3_000_000)          return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(userService.updatePhoto(auth.getName(), photoUrl));
    }

    /**
     * DELETE /api/profile/delete
     * Permanently deletes the authenticated user's account.
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteAccount(Authentication auth) {
        userService.deleteAccount(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}
