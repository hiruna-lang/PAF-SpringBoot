package backend.Module_4.Auth.controller;

import backend.Module_4.Auth.dto.AuthResponse;
import backend.Module_4.Auth.dto.LoginRequest;
import backend.Module_4.Auth.dto.RegisterRequest;
import backend.Module_4.Auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserService userService;

    /**
     * POST /api/auth/register
     * Body: { name, email, password, phoneNumber }
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    /**
     * POST /api/auth/login
     * Body: { email, password }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    /**
     * GET /api/auth/google
     * Spring Security redirects this to Google automatically.
     * After success, OAuth2SuccessHandler redirects to frontend with ?token=...
     */
    @GetMapping("/google")
    public ResponseEntity<Map<String, String>> googleLoginInfo() {
        return ResponseEntity.ok(Map.of(
                "message", "Redirect your browser to /oauth2/authorization/google to start Google login"
        ));
    }
}
