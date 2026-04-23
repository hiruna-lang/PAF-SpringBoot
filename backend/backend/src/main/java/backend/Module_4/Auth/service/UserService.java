package backend.Module_4.Auth.service;

import backend.Module_4.Auth.dto.AuthResponse;
import backend.Module_4.Auth.dto.LoginRequest;
import backend.Module_4.Auth.dto.RegisterRequest;
import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.repository.UserRepository;
import backend.Module_4.Auth.util.JwtUtil;
import backend.Module_4.Notification.service.M4NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired private UserRepository         userRepository;
    @Autowired private PasswordEncoder        passwordEncoder;
    @Autowired private JwtUtil                jwtUtil;
    @Autowired private M4NotificationService  notificationService;
    @Autowired private UserIdService          userIdService;

    // ── Register ───────────────────────────────────────────────────────────────

    /**
     * Register a new local user.
     * The very first user in the DB becomes ADMIN; everyone else starts as USER.
     * A role-prefixed sequential ID (USR-0001, ADM-0001, …) is assigned here.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        // Determine role first so we can generate the right ID prefix
        long userCount = userRepository.count();
        Role role = (userCount == 0) ? Role.ADMIN : Role.USER;

        User user = new User();
        user.setId(userIdService.nextId(role));          // e.g. ADM-0001 or USR-0001
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProvider("LOCAL");
        user.setRole(role);

        userRepository.save(user);
        notificationService.notifyRegister(user.getEmail(), user.getName());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return toAuthResponse(user, token);
    }

    // ── Login ──────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null) {
            throw new RuntimeException(
                "This account uses Google login. Please sign in with Google.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Back-fill ID for users created before this feature was added
        if (user.getId() == null || !user.getId().contains("-")) {
            user.setId(userIdService.nextId(user.getRole()));
            userRepository.save(user);
        }

        notificationService.notifyLogin(user.getEmail(), user.getName());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return toAuthResponse(user, token);
    }

    // ── Admin: list all users ──────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ── Admin: change role ─────────────────────────────────────────────────────

    /**
     * Changes a user's role.
     * NOTE: the user's ID prefix is intentionally NOT changed — it reflects
     * the role at the time of account creation.
     */
    public User updateRole(String userId, Role newRole, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);
        notificationService.notifyRoleChange(user.getEmail(), newRole.name(), adminEmail);
        return user;
    }

    public User updateRole(String userId, Role newRole) {
        return updateRole(userId, newRole, "an administrator");
    }

    // ── Profile photo ──────────────────────────────────────────────────────────

    public AuthResponse updatePhoto(String email, String photoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPhotoUrl(photoUrl);
        userRepository.save(user);
        notificationService.notifyPhotoUpdate(email);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());
        return toAuthResponse(user, token);
    }

    // ── Get profile ────────────────────────────────────────────────────────────

    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                user.getId(),
                token,
                user.getEmail(),
                user.getName(),
                user.getProvider(),
                user.getRole().name(),
                user.getPhotoUrl()
        );
    }
}
