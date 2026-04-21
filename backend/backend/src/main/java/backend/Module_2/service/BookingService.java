package backend.Module_2.service;

import backend.Module_2.dto.BookingRequestDto;
import backend.Module_2.dto.BookingResponseDto;
import backend.Module_2.dto.BookingStatusUpdateDto;

import java.util.List;

public interface BookingService {

    BookingResponseDto createBooking(BookingRequestDto dto);

    List<BookingResponseDto> getMyBookings(String userEmail);

    List<BookingResponseDto> getAllBookings(String status);

    BookingResponseDto getBookingById(Long id);

    BookingResponseDto updateBookingStatus(Long id, BookingStatusUpdateDto dto);

    void cancelBooking(Long id, String userEmail);
}