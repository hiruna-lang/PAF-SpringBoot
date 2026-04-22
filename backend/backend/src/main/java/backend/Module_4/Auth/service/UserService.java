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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private M4NotificationService notificationService;

    /** Register a new local user — first user becomes ADMIN, rest are USER */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProvider("LOCAL");

        // First registered user gets ADMIN role automatically
        long userCount = userRepository.count();
        user.setRole(userCount == 0 ? Role.ADMIN : Role.USER);

        userRepository.save(user);

        // Notify the new user
        notificationService.notifyRegister(user.getEmail(), user.getName());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getProvider(), user.getRole().name(), user.getPhotoUrl());
    }

    /** Login with email + password */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null) {
            throw new RuntimeException("This account uses Google login. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Notify the user of the sign-in
        notificationService.notifyLogin(user.getEmail(), user.getName());

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getProvider(), user.getRole().name(), user.getPhotoUrl());
    }

    /** Get all users — ADMIN only */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Change a user's role — ADMIN only (also notifies the affected user) */
    public User updateRole(String userId, Role newRole, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        userRepository.save(user);

        // Notify the user whose role changed
        notificationService.notifyRoleChange(user.getEmail(), newRole.name(), adminEmail);

        return user;
    }

    /** Overload kept for backward compatibility (no admin email known) */
    public User updateRole(String userId, Role newRole) {
        return updateRole(userId, newRole, "an administrator");
    }

    /** Save profile photo (base64 data URL) for the authenticated user */
    public AuthResponse updatePhoto(String email, String photoUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPhotoUrl(photoUrl);
        userRepository.save(user);

        // Notify the user
        notificationService.notifyPhotoUpdate(email);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getProvider(), user.getRole().name(), user.getPhotoUrl());
    }

    /** Get current user profile by email */
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
