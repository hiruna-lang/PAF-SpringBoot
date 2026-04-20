package backend.Module_4.Auth.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String name;
    private String provider;

    public AuthResponse(String token, String email, String name, String provider) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.provider = provider;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
