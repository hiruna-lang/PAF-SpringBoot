package backend.Module_2.dto;

import backend.Module_2.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingStatusUpdateDto {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String adminReason;
}