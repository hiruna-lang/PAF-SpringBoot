import React from "react";

export default function BookingList({
  title,
  bookings,
  onCancel,
  showCancel = false,
}) {
  return (
    <div className="content-card">
      <h3>{title}</h3>

      {bookings.length === 0 ? (
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
                {showCancel && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
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
                  {showCancel && (
                    <td>
                      {booking.status === "APPROVED" ? (
                        <button
                          className="cancel-btn"
                          onClick={() => onCancel(booking.id, booking.userEmail)}
                        >
                          Cancel
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}