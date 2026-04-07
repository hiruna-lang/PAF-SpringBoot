package backend.Module_2.repository;

import backend.Module_2.entity.Booking;
import backend.Module_2.entity.Resource;
import backend.Module_2.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

    List<Booking> findByResourceAndBookingDateAndStatusIn(
            Resource resource,
            LocalDate bookingDate,
            List<BookingStatus> statuses
    );

    boolean existsByResourceAndBookingDateAndStartTimeLessThanAndEndTimeGreaterThanAndStatusIn(
            Resource resource,
            LocalDate bookingDate,
            LocalTime endTime,
            LocalTime startTime,
            List<BookingStatus> statuses
    );
}