package backend.Module_2.Booking.repository;

import backend.Module_2.Booking.model.Booking;
import backend.Module_2.Booking.model.BookingStatus;
import backend.Module_4.Auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser(User user);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserAndStatus(User user, BookingStatus status);

    /** Detect overlapping PENDING or APPROVED bookings for the same resource+date */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.bookingDate = :date
          AND b.status IN (backend.Module_2.Booking.model.BookingStatus.PENDING,
                           backend.Module_2.Booking.model.BookingStatus.APPROVED)
          AND b.startTime < :endTime
          AND b.endTime   > :startTime
    """)
    List<Booking> findConflicts(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    /** Same as above but exclude a specific booking id (used during approval) */
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.bookingDate = :date
          AND b.id <> :excludeId
          AND b.status IN (backend.Module_2.Booking.model.BookingStatus.PENDING,
                           backend.Module_2.Booking.model.BookingStatus.APPROVED)
          AND b.startTime < :endTime
          AND b.endTime   > :startTime
    """)
    List<Booking> findConflictsExcluding(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("excludeId") Long excludeId
    );

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    // ── Analytics queries ─────────────────────────────────────────────────────

    /** Top resources by total approved booking count */
    @Query("""
        SELECT b.resource.id, b.resource.name, COUNT(b) AS bookingCount
        FROM Booking b
        WHERE b.status = backend.Module_2.Booking.model.BookingStatus.APPROVED
        GROUP BY b.resource.id, b.resource.name
        ORDER BY bookingCount DESC
    """)
    List<Object[]> findTopResourcesByBookings();

    /** Booking counts grouped by status */
    @Query("SELECT b.status, COUNT(b) FROM Booking b GROUP BY b.status")
    List<Object[]> countByStatus();

    /** Pending bookings older than today (potential backlog) */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = backend.Module_2.Booking.model.BookingStatus.PENDING")
    long countPending();

    /** Count of today's approved bookings */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = backend.Module_2.Booking.model.BookingStatus.APPROVED AND b.bookingDate = :today")
    long countApprovedToday(@Param("today") LocalDate today);
}
