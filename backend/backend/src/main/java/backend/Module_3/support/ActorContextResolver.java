package backend.Module_3.support;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import backend.Module_3.enums.UserRole;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Base64;
import java.util.Map;

@Component
public class ActorContextResolver {

    // Demo token → fixed identity (matches M3 constants.js DEMO_PROFILES)
    private static final Map<String, ActorContext> DEMO_TOKENS = Map.of(
        "demo-user-token",       new ActorContext("user-100",  "nethmi.perera@campus.edu",  "Nethmi Perera",    UserRole.USER),
        "demo-admin-token",      new ActorContext("admin-200", "ayesha.fernando@campus.edu","Ayesha Fernando",  UserRole.ADMIN),
        "demo-technician-token", new ActorContext("tech-300",  "ishan.silva@campus.edu",    "Ishan Silva",      UserRole.TECHNICIAN)
    );

    public ActorContext resolve(HttpServletRequest request) {
        String token = extractToken(request.getHeader("Authorization"));

        if (token != null) {
            // 1. Check demo tokens first
            ActorContext demo = DEMO_TOKENS.get(token);
            if (demo != null) return demo;

            // 2. Real M4 JWT — decode payload to get email and role
            String emailFromJwt = extractEmailFromJwt(token);
            String roleFromJwt  = extractRoleFromJwt(token);

            // X-User-* headers can override JWT claims (sent by M3 frontend)
            String userId   = request.getHeader("X-User-Id");
            String userName = request.getHeader("X-User-Name");
            String roleVal  = request.getHeader("X-User-Role");

            // Prefer header role, fall back to JWT role claim
            String effectiveRoleStr = StringUtils.hasText(roleVal) ? roleVal.trim().toUpperCase()
                                    : (roleFromJwt != null ? roleFromJwt.toUpperCase() : "USER");

            // Map M4 roles (MANAGER) to M3 roles (ADMIN)
            UserRole role = mapToM3Role(effectiveRoleStr);

            // Email: prefer JWT sub (most reliable), fall back to X-User-Id if it looks like an email
            String resolvedEmail = emailFromJwt != null ? emailFromJwt
                                 : (StringUtils.hasText(userId) && userId.contains("@") ? userId : null);

            String resolvedId   = resolvedEmail != null ? resolvedEmail
                                : (StringUtils.hasText(userId) ? userId : token);
            String resolvedName = StringUtils.hasText(userName) ? userName : "External User";

            return new ActorContext(resolvedId, resolvedEmail, resolvedName, role);
        }

        // No Authorization header — fall back to X-User-* headers only
        String userId   = request.getHeader("X-User-Id");
        String userName = request.getHeader("X-User-Name");
        String roleVal  = request.getHeader("X-User-Role");

        UserRole role = mapToM3Role(StringUtils.hasText(roleVal) ? roleVal.trim().toUpperCase() : "USER");

        String resolvedEmail = (StringUtils.hasText(userId) && userId.contains("@")) ? userId : null;

        return new ActorContext(
                StringUtils.hasText(userId) ? userId : "guest-user",
                resolvedEmail,
                StringUtils.hasText(userName) ? userName : "Guest User",
                role);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private UserRole mapToM3Role(String roleStr) {
        if (roleStr == null) return UserRole.USER;
        return switch (roleStr) {
            case "ADMIN", "MANAGER" -> UserRole.ADMIN;
            case "TECHNICIAN"       -> UserRole.TECHNICIAN;
            default                 -> UserRole.USER;
        };
    }

    private String extractToken(String authorizationHeader) {
        if (!StringUtils.hasText(authorizationHeader) || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        return authorizationHeader.substring(7).trim();
    }

    /**
     * Decodes the JWT payload (base64url) and extracts the "sub" claim (email).
     * Does NOT verify the signature — handled by Spring Security's JwtAuthFilter.
     */
    private String extractEmailFromJwt(String token) {
        return extractJwtClaim(token, "sub");
    }

    /**
     * Extracts the "role" claim from the JWT payload.
     */
    private String extractRoleFromJwt(String token) {
        return extractJwtClaim(token, "role");
    }

    private String extractJwtClaim(String token, String claimKey) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            byte[] decoded = Base64.getUrlDecoder().decode(padBase64(parts[1]));
            String payload = new String(decoded, java.nio.charset.StandardCharsets.UTF_8);
            return extractJsonString(payload, claimKey);
        } catch (Exception e) {
            return null;
        }
    }

    private String padBase64(String base64) {
        int pad = 4 - (base64.length() % 4);
        if (pad < 4) base64 += "=".repeat(pad);
        return base64;
    }

    /** Extracts a string value from a JSON string without a full JSON parser. */
    private String extractJsonString(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx < 0) return null;
        int colon = json.indexOf(':', idx + search.length());
        if (colon < 0) return null;
        // Value could be a string (quoted) or a number/boolean (unquoted)
        int afterColon = colon + 1;
        while (afterColon < json.length() && json.charAt(afterColon) == ' ') afterColon++;
        if (afterColon >= json.length()) return null;
        if (json.charAt(afterColon) == '"') {
            int start = afterColon + 1;
            int end = json.indexOf('"', start);
            if (end < 0) return null;
            return json.substring(start, end);
        }
        // Non-string value — read until comma, } or end
        int end = afterColon;
        while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}') end++;
        return json.substring(afterColon, end).trim();
    }
}
