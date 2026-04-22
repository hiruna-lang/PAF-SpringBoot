package backend.Module_2.Booking.controller;

import backend.Module_2.Booking.dto.BookingAnalyticsResponse;
import backend.Module_2.Booking.dto.BookingRequest;
import backend.Module_2.Booking.dto.BookingResponse;
import backend.Module_2.Booking.dto.BookingStatusRequest;
import backend.Module_2.Booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/m2/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /** POST /api/m2/bookings — any authenticated user */
    @PostMapping
    public ResponseEntity<?> create(
        @Valid @RequestBody BookingRequest req,
        Authentication auth
    ) {
        try {
            return ResponseEntity.status(201).body(bookingService.createBooking(auth.getName(), req));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** GET /api/m2/bookings/my?status= — current user's own bookings */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
        @RequestParam(required = false) String status,
        Authentication auth
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(auth.getName(), status));
    }

    /** GET /api/m2/bookings/{id} — owner or admin */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id, Authentication auth) {
        try {
            boolean isAdmin = isAdmin(auth);
            return ResponseEntity.ok(bookingService.getBookingById(id, auth.getName(), isAdmin));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** GET /api/m2/bookings?status= — admin: all bookings */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAll(
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(bookingService.getAllBookings(status));
    }

    /** GET /api/m2/bookings/analytics — admin: usage analytics */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(bookingService.getAnalytics());
    }

    /** PATCH /api/m2/bookings/{id}/approve — admin */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approve(
        @PathVariable Long id,
        @RequestBody(required = false) BookingStatusRequest body
    ) {
        try {
            String reason = body != null ? body.getReason() : null;
            return ResponseEntity.ok(bookingService.approveBooking(id, reason));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** PATCH /api/m2/bookings/{id}/reject — admin */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> reject(
        @PathVariable Long id,
        @RequestBody(required = false) BookingStatusRequest body
    ) {
        try {
            String reason = body != null ? body.getReason() : null;
            return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** PATCH /api/m2/bookings/{id}/cancel — owner or admin */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(
        @PathVariable Long id,
        @RequestBody(required = false) BookingStatusRequest body,
        Authentication auth
    ) {
        try {
            boolean admin = isAdmin(auth);
            String reason = body != null ? body.getReason() : null;
            return ResponseEntity.ok(bookingService.cancelBooking(id, auth.getName(), admin, reason));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
