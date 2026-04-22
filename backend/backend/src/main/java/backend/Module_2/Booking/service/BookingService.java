package backend.Module_2.Booking.service;

import backend.Module_2.Booking.dto.BookingAnalyticsResponse;
import backend.Module_2.Booking.dto.BookingRequest;
import backend.Module_2.Booking.dto.BookingResponse;
import backend.Module_2.Booking.model.Booking;
import backend.Module_2.Booking.model.BookingStatus;
import backend.Module_2.Booking.model.Resource;
import backend.Module_2.Booking.model.ResourceStatus;
import backend.Module_2.Booking.repository.BookingRepository;
import backend.Module_2.Booking.repository.ResourceRepository;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private UserRepository userRepository;

    // ── Create booking ────────────────────────────────────────────────────────

    public BookingResponse createBooking(String userEmail, BookingRequest req) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Resource resource = resourceRepository.findById(req.getResourceId())
            .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalStateException(
                "Resource '" + resource.getName() + "' is currently " + resource.getStatus().name().replace("_", " ") + " and cannot be booked"
            );
        }

        validateTimeRange(req.getBookingDate(), req.getStartTime(), req.getEndTime());

        List<Booking> conflicts = bookingRepository.findConflicts(
            resource.getId(), req.getBookingDate(), req.getStartTime(), req.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException(
                "Scheduling conflict: the resource is already booked during " +
                req.getStartTime() + "–" + req.getEndTime() + " on " + req.getBookingDate()
            );
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setBookingDate(req.getBookingDate());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setPurpose(req.getPurpose());
        booking.setExpectedAttendees(req.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    // ── Get my bookings ───────────────────────────────────────────────────────

    public List<BookingResponse> getMyBookings(String userEmail, String status) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Booking> bookings;
        if (status != null && !status.isBlank()) {
            BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
            bookings = bookingRepository.findByUserAndStatus(user, bs);
        } else {
            bookings = bookingRepository.findByUserOrderByCreatedAtDesc(user);
        }
        return bookings.stream().map(BookingResponse::from).collect(Collectors.toList());
    }

    // ── Get all bookings (admin) ──────────────────────────────────────────────

    public List<BookingResponse> getAllBookings(String status) {
        List<Booking> bookings;
        if (status != null && !status.isBlank()) {
            BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
            bookings = bookingRepository.findByStatus(bs);
        } else {
            bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        }
        return bookings.stream().map(BookingResponse::from).collect(Collectors.toList());
    }

    // ── Get single booking ────────────────────────────────────────────────────

    public BookingResponse getBookingById(Long id, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!isAdmin && !booking.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("Access denied");
        }
        return BookingResponse.from(booking);
    }

    // ── Admin: approve ────────────────────────────────────────────────────────

    public BookingResponse approveBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        // Re-check for approved conflicts at approval time
        long approvedConflicts = bookingRepository
            .findConflictsExcluding(
                booking.getResource().getId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getId()
            )
            .stream()
            .filter(c -> c.getStatus() == BookingStatus.APPROVED)
            .count();

        if (approvedConflicts > 0) {
            throw new IllegalStateException(
                "Cannot approve: another booking is already approved for this time slot"
            );
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(reason);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    // ── Admin: reject ─────────────────────────────────────────────────────────

    public BookingResponse rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    // ── Cancel booking ────────────────────────────────────────────────────────

    public BookingResponse cancelBooking(Long id, String userEmail, boolean isAdmin, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!isAdmin && !booking.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("Access denied");
        }
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only APPROVED or PENDING bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminReason(reason);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    // ── Analytics (admin) ─────────────────────────────────────────────────────

    public BookingAnalyticsResponse getAnalytics() {
        BookingAnalyticsResponse analytics = new BookingAnalyticsResponse();

        analytics.setTotalBookings(bookingRepository.count());
        analytics.setPendingCount(bookingRepository.countPending());
        analytics.setApprovedTodayCount(bookingRepository.countApprovedToday(LocalDate.now()));

        // Status breakdown
        Map<String, Long> breakdown = new LinkedHashMap<>();
        for (Object[] row : bookingRepository.countByStatus()) {
            breakdown.put(row[0].toString(), (Long) row[1]);
        }
        analytics.setStatusBreakdown(breakdown);

        // Top 5 resources
        List<BookingAnalyticsResponse.TopResource> topResources = bookingRepository
            .findTopResourcesByBookings()
            .stream()
            .limit(5)
            .map(row -> new BookingAnalyticsResponse.TopResource(
                (Long) row[0], (String) row[1], (Long) row[2]
            ))
            .collect(Collectors.toList());
        analytics.setTopResources(topResources);

        return analytics;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateTimeRange(LocalDate date, java.time.LocalTime start, java.time.LocalTime end) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Booking date cannot be in the past");
        }
    }
}
