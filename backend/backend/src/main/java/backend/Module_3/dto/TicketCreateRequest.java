package backend.Module_3.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.web.multipart.MultipartFile;

import backend.Module_3.enums.TicketPriority;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class TicketCreateRequest {

    // 🔥 Only 10 digits allowed
    private static final Pattern CONTACT_PATTERN = Pattern.compile("^[0-9]{10}$");

    @NotBlank(message = "Resource or location is required.")
    @Size(max = 120, message = "Resource or location must be 120 characters or fewer.")
    private String resource;

    @NotBlank(message = "Category is required.")
    @Size(max = 80, message = "Category must be 80 characters or fewer.")
    private String category;

    @NotNull(message = "Priority is required.")
    private TicketPriority priority;

    @NotBlank(message = "Description is required.")
    @Size(max = 1000, message = "Description must be 1000 characters or fewer.")
    private String description;

    @NotBlank(message = "Preferred contact is required.")
    @Size(max = 120, message = "Preferred contact must be 120 characters or fewer.")
    private String preferredContact;

    @Size(max = 3, message = "Only 3 attachments are allowed.")
    private List<MultipartFile> attachments = new ArrayList<>();

    // 🔥 Phone validation
    @AssertTrue(message = "Phone number must contain exactly 10 digits.")
    public boolean isPreferredContactValid() {
        if (preferredContact == null || preferredContact.isBlank()) {
            return false;
        }
        return CONTACT_PATTERN.matcher(preferredContact.trim()).matches();
    }

    // 🔥 Description validation (no special characters)
    @AssertTrue(message = "Description cannot contain special characters.")
    public boolean isDescriptionValid() {
        if (description == null || description.isBlank()) {
            return true;
        }
        return description.matches("^[a-zA-Z0-9 ]*$");
    }

    // getters & setters

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPreferredContact() {
        return preferredContact;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
    }

    public List<MultipartFile> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<MultipartFile> attachments) {
        this.attachments = attachments;
    }
}