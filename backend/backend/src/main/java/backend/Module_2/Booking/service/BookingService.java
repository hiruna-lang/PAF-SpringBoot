package backend.Module_2.Booking.service;

import backend.Module_1.enums.ResourceStatus;
import backend.Module_1.model.Resource;
import backend.Module_1.repository.ResourceRepository;
import backend.Module_2.Booking.dto.BookingAnalyticsResponse;
import backend.Module_2.Booking.dto.BookingRequest;
import backend.Module_2.Booking.dto.BookingResponse;
import backend.Module_2.Booking.model.Booking;
import backend.Module_2.Booking.model.BookingStatus;
import backend.Module_2.Booking.repository.BookingRepository;
import backend.Module_4.Auth.model.User;
import backend.Module_4.Auth.repository.UserRepository;
import backend.Module_4.Notification.service.M4NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ResourceRepository resourceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private M4NotificationService notificationService;

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

        List<Booking> conflicts = bookingRepository
            .findByResource_IdAndBookingDateAndStatusIn(
                resource.getId(),
                req.getBookingDate(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED)
            )
            .stream()
            .filter(b -> b.getStartTime().isBefore(req.getEndTime()) && b.getEndTime().isAfter(req.getStartTime()))
            .collect(Collectors.toList());
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException(
                "Scheduling conflict: the resource is already booked during " +
                req.getStartTime() + "–" + req.getEndTime() + " on " + req.getBookingDate()
            );
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUserId(user.getId());
        booking.setUserName(user.getName());
        booking.setUserEmail(user.getEmail());
        booking.setBookingDate(req.getBookingDate());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setPurpose(req.getPurpose());
        booking.setExpectedAttendees(req.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        // Notify the user their booking is pending
        notificationService.notifyBookingCreated(
                user.getEmail(),
                resource.getName(),
                req.getBookingDate().toString());

        return BookingResponse.from(saved);
    }

    // ── Get my bookings ───────────────────────────────────────────────────────

    public List<BookingResponse> getMyBookings(String userEmail, String status) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Booking> bookings;
        if (status != null && !status.isBlank()) {
            BookingStatus bs = BookingStatus.valueOf(status.toUpperCase());
            bookings = bookingRepository.findByUserEmailAndStatus(user.getEmail(), bs);
        } else {
            bookings = bookingRepository.findByUserEmailOrderByCreatedAtDesc(user.getEmail());
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

    public BookingResponse getBookingById(String id, String userEmail, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!isAdmin && !booking.getUserEmail().equals(userEmail)) {
            throw new SecurityException("Access denied");
        }
        return BookingResponse.from(booking);
    }

    // ── Admin: approve ────────────────────────────────────────────────────────

    public BookingResponse approveBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved");
        }

        // Re-check for approved conflicts at approval time
        long approvedConflicts = bookingRepository
            .findByResource_IdAndBookingDateAndStatusInAndIdNot(
                booking.getResource().getId(),
                booking.getBookingDate(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED),
                booking.getId()
            )
            .stream()
            .filter(c -> c.getStatus() == BookingStatus.APPROVED)
            .filter(c -> c.getStartTime().isBefore(booking.getEndTime()) && c.getEndTime().isAfter(booking.getStartTime()))
            .count();

        if (approvedConflicts > 0) {
            throw new IllegalStateException(
                "Cannot approve: another booking is already approved for this time slot"
            );
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setAdminReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify the booking owner
        notificationService.notifyBookingApproved(
                saved.getUserEmail(),
                saved.getResource() != null ? saved.getResource().getName() : "resource",
                saved.getBookingDate().toString(),
                reason);

        return BookingResponse.from(saved);
    }

    // ── Admin: reject ─────────────────────────────────────────────────────────

    public BookingResponse rejectBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify the booking owner
        notificationService.notifyBookingRejected(
                saved.getUserEmail(),
                saved.getResource() != null ? saved.getResource().getName() : "resource",
                saved.getBookingDate().toString(),
                reason);

        return BookingResponse.from(saved);
    }

    // ── Cancel booking ────────────────────────────────────────────────────────

    public BookingResponse cancelBooking(String id, String userEmail, boolean isAdmin, String reason) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!isAdmin && !booking.getUserEmail().equals(userEmail)) {
            throw new SecurityException("Access denied");
        }
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only APPROVED or PENDING bookings can be cancelled");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setAdminReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify the booking owner
        notificationService.notifyBookingCancelled(
                saved.getUserEmail(),
                saved.getResource() != null ? saved.getResource().getName() : "resource",
                saved.getBookingDate().toString());

        return BookingResponse.from(saved);
    }

    // ── Analytics (admin) ─────────────────────────────────────────────────────

    public BookingAnalyticsResponse getAnalytics() {
        BookingAnalyticsResponse analytics = new BookingAnalyticsResponse();

        List<Booking> all = bookingRepository.findAll();
        analytics.setTotalBookings(all.size());

        long pendingCount = all.stream()
            .filter(b -> b.getStatus() == BookingStatus.PENDING)
            .count();
        analytics.setPendingCount(pendingCount);

        long approvedToday = all.stream()
            .filter(b -> b.getStatus() == BookingStatus.APPROVED)
            .filter(b -> LocalDate.now().equals(b.getBookingDate()))
            .count();
        analytics.setApprovedTodayCount(approvedToday);

        Map<String, Long> breakdown = all.stream()
            .filter(b -> b.getStatus() != null)
            .collect(Collectors.groupingBy(
                b -> b.getStatus().name(),
                LinkedHashMap::new,
                Collectors.counting()
            ));
        analytics.setStatusBreakdown(breakdown);

        Map<String, Long> resourceCounts = all.stream()
            .filter(b -> b.getStatus() == BookingStatus.APPROVED)
            .map(Booking::getResource)
            .filter(Objects::nonNull)
            .collect(Collectors.groupingBy(Resource::getId, Collectors.counting()));

        Map<String, String> resourceNames = all.stream()
            .map(Booking::getResource)
            .filter(Objects::nonNull)
            .collect(Collectors.toMap(
                Resource::getId,
                Resource::getName,
                (left, right) -> left
            ));

        List<BookingAnalyticsResponse.TopResource> topResources = resourceCounts.entrySet()
            .stream()
            .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
            .limit(5)
            .map(entry -> new BookingAnalyticsResponse.TopResource(
                entry.getKey(),
                resourceNames.get(entry.getKey()),
                entry.getValue()
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
