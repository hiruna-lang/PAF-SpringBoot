package backend.Module_3.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TechnicianRequest {
    @NotBlank(message = "Operative name is required.")
    @Size(max = 80, message = "Operative name must be 80 characters or fewer.")
    private String name;

    @NotBlank(message = "Division specialization is required.")
    @Size(max = 80, message = "Division specialization must be 80 characters or fewer.")
    private String specialization;

    @Size(max = 20, message = "Direct line must be 20 characters or fewer.")
    @Pattern(regexp = "^$|^[0-9+()\\-\\s]{7,20}$", message = "Direct line must be a valid phone number.")
    private String phone;

    @NotBlank(message = "Comms email is required.")
    @Email(message = "Comms email must be a valid email address.")
    @Size(max = 120, message = "Comms email must be 120 characters or fewer.")
    private String email;

    @NotBlank(message = "Access credential is required.")
    @Size(min = 8, max = 64, message = "Access credential must be between 8 and 64 characters.")
    private String password;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
