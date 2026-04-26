package backend.Module_4.Auth.oauth2;

import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.repository.UserRepository;
import backend.Module_4.Auth.service.UserIdService;
import backend.Module_4.Auth.util.JwtUtil;
import backend.Module_4.Notification.service.M4NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired private UserRepository        userRepository;
    @Autowired private JwtUtil               jwtUtil;
    @Autowired private M4NotificationService notificationService;
    @Autowired private UserIdService         userIdService;

    @Value("${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email    = oAuth2User.getAttribute("email");
        String name     = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String picture  = oAuth2User.getAttribute("picture");

        Optional<User> existing = userRepository.findByEmail(email);

        User user;
        boolean isNewUser = false;

        if (existing.isPresent()) {
            user = existing.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setProvider("GOOGLE");
            }
            if (picture != null) user.setPhotoUrl(picture);

            // Back-fill ID for users created before this feature
            if (user.getId() == null || !user.getId().contains("-")) {
                user.setId(userIdService.nextId(user.getRole()));
            }

            userRepository.save(user);
        } else {
            // New Google user — first ever user becomes ADMIN
            Role role = (userRepository.count() == 0) ? Role.ADMIN : Role.USER;

            user = new User();
            user.setId(userIdService.nextId(role));
            user.setEmail(email);
            user.setName(name);
            user.setGoogleId(googleId);
            user.setProvider("GOOGLE");
            user.setPhotoUrl(picture);
            user.setRole(role);
            userRepository.save(user);
            isNewUser = true;
        }

        if (isNewUser) {
            notificationService.notifyRegister(user.getEmail(), user.getName());
        } else {
            notificationService.notifyLogin(user.getEmail(), user.getName());
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId());

        String redirectUrl = redirectUri
                + "?token="   + token
                + "&role="    + user.getRole().name()
                + "&isNew="   + isNewUser
                + "&userId="  + URLEncoder.encode(user.getId(), StandardCharsets.UTF_8)
                + "&name="    + URLEncoder.encode(user.getName()     != null ? user.getName()     : "", StandardCharsets.UTF_8)
                + "&photo="   + URLEncoder.encode(user.getPhotoUrl() != null ? user.getPhotoUrl() : "", StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
