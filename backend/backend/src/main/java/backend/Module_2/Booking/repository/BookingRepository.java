package backend.Module_2.Booking.repository;

import backend.Module_2.Booking.model.Booking;
import backend.Module_2.Booking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserEmail(String email);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByUserEmailAndStatus(String email, BookingStatus status);

    List<Booking> findByResource_IdAndBookingDateAndStatusIn(
        String resourceId,
        LocalDate date,
        List<BookingStatus> statuses
    );

    List<Booking> findByResource_IdAndBookingDateAndStatusInAndIdNot(
        String resourceId,
        LocalDate date,
        List<BookingStatus> statuses,
        String excludeId
    );

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);
}
