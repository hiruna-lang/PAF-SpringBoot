package backend.Module_4.Auth.oauth2;

import backend.Module_4.Auth.model.Role;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.repository.UserRepository;
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
import java.util.Optional;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private M4NotificationService notificationService;

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

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        boolean isNewUser = false;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setProvider("GOOGLE");
            }
            if (picture != null) user.setPhotoUrl(picture);
            userRepository.save(user);
        } else {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setGoogleId(googleId);
            user.setProvider("GOOGLE");
            user.setPhotoUrl(picture);
            long count = userRepository.count();
            user.setRole(count == 0 ? Role.ADMIN : Role.USER);
            userRepository.save(user);
            isNewUser = true;
        }

        // Fire notification for the auth event
        if (isNewUser) {
            notificationService.notifyRegister(user.getEmail(), user.getName());
        } else {
            notificationService.notifyLogin(user.getEmail(), user.getName());
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        String redirectUrl = redirectUri
                + "?token=" + token
                + "&role=" + user.getRole().name()
                + "&name=" + java.net.URLEncoder.encode(user.getName() != null ? user.getName() : "", "UTF-8")
                + "&photo=" + java.net.URLEncoder.encode(user.getPhotoUrl() != null ? user.getPhotoUrl() : "", "UTF-8");

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
