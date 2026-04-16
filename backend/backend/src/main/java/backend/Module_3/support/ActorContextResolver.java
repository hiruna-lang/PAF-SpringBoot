package backend.Module_3.support;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import backend.Module_3.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class ActorContextResolver {

    public ActorContext resolve(HttpServletRequest request) {
        String token = extractToken(request.getHeader("Authorization"));

        if (token != null) {
            return switch (token) {
                case "demo-user-token" -> new ActorContext("user-100", "Nethmi Perera", UserRole.USER);
                case "demo-admin-token" -> new ActorContext("admin-200", "Ayesha Fernando", UserRole.ADMIN);
                case "demo-technician-token" -> new ActorContext("tech-300", "Ishan Silva", UserRole.TECHNICIAN);
                default -> new ActorContext(token, "External User", UserRole.USER);
            };
        }

        String userId = request.getHeader("X-User-Id");
        String userName = request.getHeader("X-User-Name");
        String roleValue = request.getHeader("X-User-Role");

        UserRole role = UserRole.USER;
        if (StringUtils.hasText(roleValue)) {
            role = UserRole.valueOf(roleValue.trim().toUpperCase());
        }

        return new ActorContext(
                StringUtils.hasText(userId) ? userId : "guest-user",
                StringUtils.hasText(userName) ? userName : "Guest User",
                role);
    }

    private String extractToken(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring(7).trim();
    }
}
