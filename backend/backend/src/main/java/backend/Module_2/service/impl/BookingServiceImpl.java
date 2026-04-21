package backend.Module_2.service.impl;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.model.Resource;
import backend.Module_1.repository.ResourceRepository;
import backend.Module_2.dto.BookingRequestDto;
import backend.Module_2.dto.BookingResponseDto;
import backend.Module_2.dto.BookingStatusUpdateDto;
import backend.Module_2.entity.Booking;
import backend.Module_2.enums.BookingStatus;
import backend.Module_2.exception.BadRequestException;
import backend.Module_2.exception.ConflictException;
import backend.Module_2.exception.ResourceNotFoundException;
import backend.Module_2.repository.BookingRepository;
import backend.Module_2.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    @Override
    public BookingResponseDto createBooking(BookingRequestDto dto) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + dto.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Selected resource is not available for booking");
        }

        if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().equals(dto.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        if (dto.getExpectedAttendees() != null
                && resource.getCapacity() != null
                && dto.getExpectedAttendees() > resource.getCapacity()) {
            throw new BadRequestException("Expected attendees exceed resource capacity");
        }

        boolean conflictExists = bookingRepository
                .existsByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
                        resource,
                        dto.getBookingDate(),
                        dto.getEndTime(),
                        dto.getStartTime(),
                        List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
                );

        if (conflictExists) {
            throw new ConflictException("Booking conflict detected for the selected resource and time range");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .userId("TEMP_USER_ID")
                .userEmail("tempuser@gmail.com")
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponseDto> getMyBookings(String userEmail) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookingResponseDto> getAllBookings(String status) {
        List<Booking> bookings;

        if (status == null || status.isBlank()) {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        } else {
            try {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid booking status: " + status);
            }
        }

        return bookings.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        return mapToResponse(booking);
    }

    @Override
    public BookingResponseDto updateBookingStatus(Long id, BookingStatusUpdateDto dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        BookingStatus currentStatus = booking.getStatus();
        BookingStatus newStatus = dto.getStatus();

        if (currentStatus == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled booking cannot be updated");
        }

        if (currentStatus == BookingStatus.REJECTED) {
            throw new BadRequestException("Rejected booking cannot be updated");
        }

        if (currentStatus == BookingStatus.APPROVED && newStatus != BookingStatus.CANCELLED) {
            throw new BadRequestException("Approved booking can only be cancelled");
        }

        if (currentStatus == BookingStatus.PENDING
                && newStatus != BookingStatus.APPROVED
                && newStatus != BookingStatus.REJECTED) {
            throw new BadRequestException("Pending booking can only be approved or rejected");
        }

        if (newStatus == BookingStatus.REJECTED
                && (dto.getAdminReason() == null || dto.getAdminReason().isBlank())) {
            throw new BadRequestException("Reason is required when rejecting a booking");
        }

        if (newStatus == BookingStatus.APPROVED) {
            List<Booking> approvedBookings = bookingRepository.findByResourceAndBookingDateAndStatusIn(
                    booking.getResource(),
                    booking.getBookingDate(),
                    List.of(BookingStatus.APPROVED)
            );

            boolean overlaps = approvedBookings.stream().anyMatch(existing ->
                    !existing.getId().equals(booking.getId()) &&
                            booking.getStartTime().isBefore(existing.getEndTime()) &&
                            booking.getEndTime().isAfter(existing.getStartTime())
            );

            if (overlaps) {
                throw new ConflictException("Cannot approve booking because it overlaps with another approved booking");
            }
        }

        booking.setStatus(newStatus);
        booking.setAdminReason(dto.getAdminReason());

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public void cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getUserEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You can cancel only your own bookings");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    private BookingResponseDto mapToResponse(Booking booking) {
        return BookingResponseDto.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceCapacity(booking.getResource().getCapacity())
                .resourceLocation(booking.getResource().getLocation())
                .resourceAvailabilityWindow(booking.getResource().getAvailabilityWindow())
                .resourceType(String.valueOf(booking.getResource().getType()))
                .resourceStatus(String.valueOf(booking.getResource().getStatus()))
                .userId(booking.getUserId())
                .userEmail(booking.getUserEmail())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .adminReason(booking.getAdminReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}