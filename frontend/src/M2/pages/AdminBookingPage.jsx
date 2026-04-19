import React, { useEffect, useState } from "react";
import BookingNavbar from "../components/BookingNavbar";
import { getAllBookings, updateBookingStatus } from "../services/bookingService";

export default function AdminBookingPage() {
  const [allBookings, setAllBookings] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("APPROVED");
  const [adminReason, setAdminReason] = useState("");
  const [message, setMessage] = useState("");

  const loadAllBookings = async () => {
    try {
      const data = await getAllBookings();
      setAllBookings(data);
    } catch (error) {
      console.error("Failed to load all bookings", error);
    }
  };

  useEffect(() => {
    loadAllBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      setMessage("Please select a booking.");
      return;
    }

    try {
      await updateBookingStatus(selectedId, { status, adminReason });
      setMessage("Booking status updated successfully.");
      setSelectedId("");
      setStatus("APPROVED");
      setAdminReason("");
      await loadAllBookings();
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to update booking.");
    }
  };

  return (
    <div className="booking-page">
      <BookingNavbar />

      <div className="booking-container">
        <div className="section-heading">
          <h2>Admin Booking Dashboard</h2>
          <p>Review and control all booking requests.</p>
        </div>

        <div className="content-card">
          <h3>Update Booking Status</h3>

          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="grid-two">
              <div>
                <label>Select Booking</label>
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                  <option value="">Choose booking</option>
                  {allBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.id} - {booking.userEmail} - {booking.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            <div>
              <label>Reason</label>
              <textarea
                rows="4"
                value={adminReason}
                onChange={(e) => setAdminReason(e.target.value)}
                placeholder="Enter a reason"
              />
            </div>

            {message && <p className="info-text">{message}</p>}

            <button type="submit" className="primary-btn">
              Update Status
            </button>
          </form>
        </div>

        <div className="content-card">
          <h3>All Booking Requests</h3>

          {allBookings.length === 0 ? (
            <p className="empty-text">No bookings found.</p>
          ) : (
            <div className="table-wrap">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Resource</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.resourceName || booking.resourceId}</td>
                      <td>{booking.userEmail}</td>
                      <td>{booking.bookingDate}</td>
                      <td>{booking.startTime} - {booking.endTime}</td>
                      <td>{booking.purpose}</td>
                      <td>{booking.expectedAttendees || "-"}</td>
                      <td>
                        <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{booking.adminReason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}