import React, { useState } from "react";
import BookingNavbar from "../components/BookingNavbar";
import BookingForm from "../components/BookingForm";
import BookingList from "../components/BookingList";
import { createBooking, getMyBookings, cancelBooking } from "../services/bookingService";

export default function UserBookingPage() {
  const [myBookings, setMyBookings] = useState([]);
  const [emailFilter, setEmailFilter] = useState("user1@gmail.com");

  const loadMyBookings = async () => {
    if (!emailFilter.trim()) return;

    try {
      const data = await getMyBookings(emailFilter);
      setMyBookings(data);
    } catch (error) {
      console.error("Failed to load my bookings", error);
    }
  };

  const handleCreateBooking = async (formData) => {
    await createBooking(formData);
    if (formData.userEmail === emailFilter) {
      await loadMyBookings();
    }
  };

  const handleCancelBooking = async (id, userEmail) => {
    await cancelBooking(id, userEmail);
    await loadMyBookings();
  };

  return (
    <div className="booking-page">
      <BookingNavbar />

      <div className="booking-container">
        <div className="section-heading">
          <h2>User Booking Portal</h2>
          <p>Create and manage your own booking requests.</p>
        </div>

        <BookingForm onCreate={handleCreateBooking} />

        <div className="content-card">
          <h3>Search My Bookings</h3>
          <div className="filter-row">
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Enter your email"
            />
            <button className="primary-btn" onClick={loadMyBookings}>
              Load My Bookings
            </button>
          </div>
        </div>

        <BookingList
          title="My Booking Requests"
          bookings={myBookings}
          onCancel={handleCancelBooking}
          showCancel={true}
        />
      </div>
    </div>
  );
}