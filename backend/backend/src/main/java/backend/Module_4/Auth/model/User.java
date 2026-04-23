package backend.Module_4.Auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Stored in the "users" collection.
 *
 * _id  = role-prefixed sequential ID assigned at creation time:
 *          USR-0001  (USER)
 *          ADM-0001  (ADMIN)
 *          TCN-0001  (TECHNICIAN)
 *
 * The ID never changes even if the role is later updated by an admin.
 */
@Document(collection = "users")
public class User {

    @Id
    private String id;           // e.g. "USR-0001" — set by UserIdService before first save

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;     // null for Google users

    private String phoneNumber;

    private String provider;     // LOCAL or GOOGLE

    private String googleId;     // Google sub/id for OAuth2 users

    private Role role = Role.USER;

    private String photoUrl;     // base64 data URL or Google CDN URL

    public User() {}

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public String getId()           { return id; }
    public void   setId(String id)  { this.id = id; }

    public String getName()             { return name; }
    public void   setName(String name)  { this.name = name; }

    public String getEmail()              { return email; }
    public void   setEmail(String email)  { this.email = email; }

    public String getPassword()                 { return password; }
    public void   setPassword(String password)  { this.password = password; }

    public String getPhoneNumber()                    { return phoneNumber; }
    public void   setPhoneNumber(String phoneNumber)  { this.phoneNumber = phoneNumber; }

    public String getProvider()                 { return provider; }
    public void   setProvider(String provider)  { this.provider = provider; }

    public String getGoogleId()                 { return googleId; }
    public void   setGoogleId(String googleId)  { this.googleId = googleId; }

    public Role getRole()             { return role; }
    public void setRole(Role role)    { this.role = role; }

    public String getPhotoUrl()                 { return photoUrl; }
    public void   setPhotoUrl(String photoUrl)  { this.photoUrl = photoUrl; }
}
