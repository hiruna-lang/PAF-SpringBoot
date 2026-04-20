package backend.Module_4.Auth.service;

import backend.Module_4.Auth.dto.AuthResponse;
import backend.Module_4.Auth.dto.LoginRequest;
import backend.Module_4.Auth.dto.RegisterRequest;
import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.repository.UserRepository;
import backend.Module_4.Auth.util.JwtUtil;
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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getProvider(), user.getRole().name());
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

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getEmail(), user.getName(),
                user.getProvider(), user.getRole().name());
    }

    /** Get all users — ADMIN only */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /** Change a user's role — ADMIN only */
    public User updateRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }
}
