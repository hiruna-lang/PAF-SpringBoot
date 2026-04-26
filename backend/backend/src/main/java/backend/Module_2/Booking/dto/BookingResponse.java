package backend.Module_2.Booking.dto;

import backend.Module_2.Booking.model.Booking;
import backend.Module_2.Booking.model.BookingStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponse {

    private String id;
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String resourceLocation;
    private String userId;
    private String userName;
    private String userEmail;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private BookingStatus status;
    private String adminReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingResponse from(Booking b) {
        BookingResponse r = new BookingResponse();
        r.id = b.getId();
        r.resourceId = b.getResource().getId();
        r.resourceName = b.getResource().getName();
        r.resourceType = b.getResource().getType().name();
        r.resourceLocation = b.getResource().getLocation();
        r.userId = b.getUserId();
        r.userName = b.getUserName();
        r.userEmail = b.getUserEmail();
        r.bookingDate = b.getBookingDate();
        r.startTime = b.getStartTime();
        r.endTime = b.getEndTime();
        r.purpose = b.getPurpose();
        r.expectedAttendees = b.getExpectedAttendees();
        r.status = b.getStatus();
        r.adminReason = b.getAdminReason();
        r.createdAt = b.getCreatedAt();
        r.updatedAt = b.getUpdatedAt();
        return r;
    }

    public String getId() { return id; }
    public String getResourceId() { return resourceId; }
    public String getResourceName() { return resourceName; }
    public String getResourceType() { return resourceType; }
    public String getResourceLocation() { return resourceLocation; }
    public String getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public LocalDate getBookingDate() { return bookingDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getPurpose() { return purpose; }
    public Integer getExpectedAttendees() { return expectedAttendees; }
    public BookingStatus getStatus() { return status; }
    public String getAdminReason() { return adminReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
