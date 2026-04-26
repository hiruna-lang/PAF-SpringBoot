package backend.Module_4.Notification.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "m4_notifications")
public class M4Notification {

    @Id
    private String id;

    /** The email of the user this notification belongs to */
    @Indexed
    private String userEmail;

    private String title;

    private String message;

    /**
     * Semantic type for icon/colour hints:
     * login | role_change | register | security | system
     * | booking | resource | ticket
     */
    private String type;

    /** Originating module: M4 | M2 | M1 | M3 */
    private String source;

    private boolean read;

    private LocalDateTime createdAt;

    public M4Notification() {}

    // ── Getters & Setters ──────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
