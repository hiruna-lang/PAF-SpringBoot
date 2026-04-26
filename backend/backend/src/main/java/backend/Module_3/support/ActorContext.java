package backend.Module_3.support;

import backend.Module_3.enums.UserRole;

/**
 * Resolved identity of the actor making a request.
 *
 * @param userId    internal user ID (may be a demo ID like "user-100" for M3 demo tokens)
 * @param userEmail email address — used for cross-module M4 notifications; may be null for guests
 * @param userName  display name
 * @param role      USER | ADMIN | TECHNICIAN
 */
public record ActorContext(String userId, String userEmail, String userName, UserRole role) {

    /** Backward-compatible constructor without email (email defaults to null). */
    public ActorContext(String userId, String userName, UserRole role) {
        this(userId, null, userName, role);
    }
}
