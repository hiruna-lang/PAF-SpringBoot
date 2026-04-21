package backend.Module_3.support;

import backend.Module_3.enums.UserRole;

public record ActorContext(String userId, String userName, UserRole role) {
}
