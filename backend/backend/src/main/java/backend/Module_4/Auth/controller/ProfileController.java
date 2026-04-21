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

    /**
     * GET /api/profile/me
     * Returns the current user's profile (including saved photoUrl from DB)
     */
    @GetMapping("/me")
    public ResponseEntity<User> getProfile(Authentication auth) {
        String email = auth.getName(); // set by JwtAuthFilter
        return ResponseEntity.ok(userService.getProfile(email));
    }

    /**
     * PUT /api/profile/photo
     * Body: { "photoUrl": "data:image/jpeg;base64,..." }
     * Saves the profile photo to the database
     */
    @PutMapping("/photo")
    public ResponseEntity<AuthResponse> updatePhoto(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        String email    = auth.getName();
        String photoUrl = body.get("photoUrl");

        if (photoUrl == null || photoUrl.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        // Limit size — base64 of 2MB image ≈ 2.7MB string
        if (photoUrl.length() > 3_000_000) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(userService.updatePhoto(email, photoUrl));
    }
}
