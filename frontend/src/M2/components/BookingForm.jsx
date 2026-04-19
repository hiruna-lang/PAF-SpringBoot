import React, { useState } from "react";

export default function BookingForm({ onCreate }) {
  const [formData, setFormData] = useState({
    resourceId: "",
    userEmail: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.resourceId ||
      !formData.userEmail ||
      !formData.bookingDate ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.purpose
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      await onCreate({
        ...formData,
        resourceId: Number(formData.resourceId),
        expectedAttendees: formData.expectedAttendees
          ? Number(formData.expectedAttendees)
          : null,
      });

      setMessage("Booking created successfully.");
      setFormData({
        resourceId: "",
        userEmail: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create booking.");
    }
  };

  return (
    <div className="content-card">
      <h3>Create Booking Request</h3>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="grid-two">
          <div>
            <label>Resource ID *</label>
            <input
              type="number"
              name="resourceId"
              value={formData.resourceId}
              onChange={handleChange}
              placeholder="Enter resource ID"
            />
          </div>

          <div>
            <label>User Email *</label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label>Booking Date *</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Expected Attendees</label>
            <input
              type="number"
              name="expectedAttendees"
              value={formData.expectedAttendees}
              onChange={handleChange}
              placeholder="Enter attendee count"
            />
          </div>
        </div>

        <div>
          <label>Purpose *</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="4"
            placeholder="Enter booking purpose"
          />
        </div>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="primary-btn">
          Submit Booking
        </button>
      </form>
    </div>
  );
}