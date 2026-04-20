package backend.Module_4.Auth.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String name;
    private String provider;
    private String role;       // USER / ADMIN / MANAGER

    public AuthResponse(String token, String email, String name, String provider, String role) {
        this.token    = token;
        this.email    = email;
        this.name     = name;
        this.provider = provider;
        this.role     = role;
    }

    public String getToken()    { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail()    { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName()     { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getRole()     { return role; }
    public void setRole(String role) { this.role = role; }
}
