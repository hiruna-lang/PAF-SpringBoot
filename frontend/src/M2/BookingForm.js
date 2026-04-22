import React, { useState } from "react";
import { createBooking } from "./bookingService";

const TYPE_ICONS = {
  ROOM: "🏫", LAB: "🔬", EQUIPMENT: "📹", SPORTS_FACILITY: "⚽", AUDITORIUM: "🎭"
};

function BookingForm({ resource, onSuccess, onCancel }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    bookingDate: today,
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
    expectedAttendees: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.purpose.trim()) { setError("Purpose is required"); return; }
    if (form.endTime <= form.startTime) { setError("End time must be after start time"); return; }
    if (form.bookingDate < today) { setError("Booking date cannot be in the past"); return; }

    setLoading(true);
    try {
      const payload = {
        resourceId: resource.id,
        bookingDate: form.bookingDate,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        ...(form.expectedAttendees ? { expectedAttendees: parseInt(form.expectedAttendees) } : {}),
      };
      const result = await createBooking(payload);
      onSuccess(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Request Booking</div>
          <button className="modal-close" onClick={onCancel} type="button">✕</button>
        </div>

        {/* Resource preview */}
        <div className="resource-preview">
          <div style={{ width: "100%", fontWeight: 700, color: "#1e1e2e", fontSize: ".9rem", marginBottom: ".25rem" }}>
            {TYPE_ICONS[resource.type]} {resource.name}
          </div>
          {resource.location && <span className="resource-preview-item">📍 <strong>{resource.location}</strong></span>}
          {resource.capacity && <span className="resource-preview-item">👥 Capacity: <strong>{resource.capacity}</strong></span>}
          {resource.availabilityNote && <span className="resource-preview-item" style={{ width: "100%" }}>🕐 {resource.availabilityNote}</span>}
        </div>

        {/* Workflow indicator */}
        <div className="workflow-bar">
          <div className="workflow-step active">
            <div className="workflow-dot">1</div>
            PENDING
          </div>
          <span className="workflow-arrow">→</span>
          <div className="workflow-step">
            <div className="workflow-dot">2</div>
            APPROVED
          </div>
          <span className="workflow-arrow">→</span>
          <div className="workflow-step" style={{ color: "#b91c1c" }}>
            <div className="workflow-dot">or</div>
            REJECTED
          </div>
        </div>

        {error && <div className="alert alert-error"><span className="alert-icon">⚠</span>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-span">
              <label className="form-label">Date <span className="required">*</span></label>
              <input
                type="date"
                min={today}
                value={form.bookingDate}
                onChange={e => set("bookingDate", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start Time <span className="required">*</span></label>
              <input
                type="time"
                value={form.startTime}
                onChange={e => set("startTime", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time <span className="required">*</span></label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => set("endTime", e.target.value)}
                required
              />
            </div>
            <div className="form-group form-span">
              <label className="form-label">Purpose <span className="required">*</span></label>
              <textarea
                value={form.purpose}
                onChange={e => set("purpose", e.target.value)}
                placeholder="e.g. Weekly team standup, CS101 practical, Department meeting..."
                required
              />
            </div>
            {resource.capacity && (
              <div className="form-group form-span">
                <label className="form-label">Expected Attendees</label>
                <input
                  type="number"
                  min="1"
                  max={resource.capacity}
                  value={form.expectedAttendees}
                  onChange={e => set("expectedAttendees", e.target.value)}
                  placeholder={`1 – ${resource.capacity}`}
                />
                <span className="form-hint">Maximum capacity: {resource.capacity}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;
