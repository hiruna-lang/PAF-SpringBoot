package backend.Module_2.controller;

import backend.Module_2.dto.BookingRequestDto;
import backend.Module_2.dto.BookingResponseDto;
import backend.Module_2.dto.BookingStatusUpdateDto;
import backend.Module_2.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody BookingRequestDto dto) {
        BookingResponseDto response = bookingService.createBooking(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings(@RequestParam String userEmail) {
        return ResponseEntity.ok(bookingService.getMyBookings(userEmail));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDto>> getAllBookings(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDto> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponseDto> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody BookingStatusUpdateDto dto
    ) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelBooking(
            @PathVariable Long id,
            @RequestParam String userEmail
    ) {
        bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}