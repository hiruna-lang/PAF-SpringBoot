import React, { useEffect, useState } from "react";
import M2Navbar from "./components/M2Navbar";
import BookingForm from "./components/BookingForm";
import BookingList from "./components/BookingList";
import AdminBookingPanel from "./components/AdminBookingPanel";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
  cancelBooking,
} from "./services/bookingService";

export default function BookingPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [emailFilter, setEmailFilter] = useState("user1@gmail.com");

  const loadAllBookings = async () => {
    try {
      const data = await getAllBookings();
      setAllBookings(data);
    } catch (error) {
      console.error("Failed to load bookings", error);
    }
  };

  const loadMyBookings = async () => {
    if (!emailFilter.trim()) return;

    try {
      const data = await getMyBookings(emailFilter);
      setMyBookings(data);
    } catch (error) {
      console.error("Failed to load my bookings", error);
    }
  };

  useEffect(() => {
    loadAllBookings();
  }, []);

  const handleCreateBooking = async (formData) => {
    await createBooking(formData);
    await loadAllBookings();
    await loadMyBookings();
  };

  const handleUpdateBooking = async (id, data) => {
    await updateBookingStatus(id, data);
    await loadAllBookings();
    await loadMyBookings();
  };

  const handleCancelBooking = async (id, userEmail) => {
    await cancelBooking(id, userEmail);
    await loadAllBookings();
    await loadMyBookings();
  };

  return (
    <div className="m2-page">
      <M2Navbar />

      <div className="m2-container">
        <BookingForm onCreate={handleCreateBooking} />

        <div className="m2-card">
          <h2>Check My Bookings</h2>
          <div className="m2-filter-row">
            <input
              type="email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Enter user email"
            />
            <button className="m2-btn" onClick={loadMyBookings}>
              Load My Bookings
            </button>
          </div>
        </div>

        <BookingList
          title="My Bookings"
          bookings={myBookings}
          onCancel={handleCancelBooking}
        />

        <AdminBookingPanel
          bookings={allBookings}
          onUpdate={handleUpdateBooking}
        />

        <BookingList
          title="All Bookings"
          bookings={allBookings}
        />
      </div>
    </div>
  );
}