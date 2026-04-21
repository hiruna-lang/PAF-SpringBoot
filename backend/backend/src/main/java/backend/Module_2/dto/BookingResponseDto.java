package backend.Module_2.dto;

import backend.Module_2.enums.BookingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDto {

    private Long id;

    private Long resourceId;
    private String resourceName;
    private Integer resourceCapacity;
    private String resourceLocation;
    private String resourceAvailabilityWindow;
    private String resourceType;
    private String resourceStatus;

    private String userId;
    private String userEmail;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status;
    private String adminReason;
    private LocalDateTime createdAt;
}