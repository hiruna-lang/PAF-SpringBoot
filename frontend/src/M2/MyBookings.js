import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyBookings, cancelBooking } from "./bookingService";
import "../Home/Home.css";
import "./M2.css";

const STATUS_COLORS = {
  PENDING: "badge-pending",
  APPROVED: "badge-approved",
  REJECTED: "badge-rejected",
  CANCELLED: "badge-cancelled",
};

const STATUS_OPTS = ["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function statusBadge(s) {
  return <span className={`badge ${STATUS_COLORS[s] || ""}`}>{s}</span>;
}

function MyBookings({ onToast }) {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookings(filter || null);
      setBookings(data);
    } catch (e) {
      onToast("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, onToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      await cancelBooking(cancelModal.id, cancelReason);
      setCancelModal(null);
      setCancelReason("");
      onToast("success", "Booking cancelled.");
      load();
    } catch (e) {
      onToast("error", e.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const counts = bookings.reduce((a, b) => {
    a[b.status] = (a[b.status] || 0) + 1;
    return a;
  }, {});

  return (
    <>
      <nav className="nav">
        <a
          className="nav-brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <span className="nav-brand-icon">SC</span>
          <span className="nav-brand-name">SmartCampus</span>
        </a>

        <div className="nav-center">
          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/m1")}
          >
            Resources
          </button>

          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/m2?tab=my-bookings")}
          >
            My Booking
          </button>

          <button
            className="nav-menu-btn nav-menu-highlight"
            type="button"
            onClick={() => navigate("/create-ticket")}
          >
            Create Ticket
          </button>
        </div>

        <div className="nav-icons">
          <button
            className="nav-icon-btn"
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
            title="Notifications"
          >
            <span className="nav-icon">🔔</span>
            <span className="nav-notification-dot"></span>
          </button>

          <button
            className="nav-icon-btn nav-profile-btn"
            type="button"
            onClick={() => navigate("/profile")}
            aria-label="Profile"
            title="Profile"
          >
            <span className="nav-icon">👤</span>
          </button>
        </div>
      </nav>

      <div id="top" className="my-bookings-page">
        <div className="my-bookings-container">
          <div className="page-header">
            <div>
              <div className="page-title">My Bookings</div>
              <div className="page-subtitle">
                Track and manage your booking requests
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={load}>
              ↺ Refresh
            </button>
          </div>

          <div className="stats-row">
            {["PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((s) => (
              <div className={`stat-card ${s.toLowerCase()}`} key={s}>
                <div className="stat-card-top">
                  <div className="stat-icon">
                    {s === "PENDING"
                      ? "⏳"
                      : s === "APPROVED"
                      ? "✅"
                      : s === "REJECTED"
                      ? "❌"
                      : "🚫"}
                  </div>
                </div>
                <div className="stat-num">{counts[s] || 0}</div>
                <div className="stat-label">{s}</div>
              </div>
            ))}
          </div>

          <div className="workflow-bar">
            <span
              style={{
                fontSize: ".78rem",
                fontWeight: 600,
                color: "#64748b",
                marginRight: ".25rem",
              }}
            >
              Workflow:
            </span>

            {["PENDING", "APPROVED", "CANCELLED"].map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <span className="workflow-arrow">→</span>}
                <div className={`workflow-step ${s === "PENDING" ? "active" : ""}`}>
                  <div className="workflow-dot">{i + 1}</div>
                  {s}
                </div>
              </React.Fragment>
            ))}

            <span className="workflow-arrow" style={{ marginLeft: ".25rem" }}>
              or
            </span>

            <div className="workflow-step" style={{ color: "#991b1b" }}>
              <div
                className="workflow-dot"
                style={{ background: "#fecaca", color: "#991b1b" }}
              >
                ✕
              </div>
              REJECTED
            </div>
          </div>

          <div className="booking-filter-row">
            {STATUS_OPTS.map((s) => (
              <button
                key={s || "all"}
                className={`btn btn-sm ${
                  filter === s ? "btn-primary" : "btn-secondary"
                }`}
                onClick={() => setFilter(s)}
              >
                {s || "All"} {s && counts[s] ? `(${counts[s]})` : ""}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <div className="empty-title">No bookings yet</div>
              <div className="empty-sub">
                Go to Resources to make your first booking
              </div>
            </div>
          ) : (
            <div className="table-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Resource</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                          {b.id}
                        </td>
                        <td>
                          <div className="td-resource">
                            <strong>{b.resourceName}</strong>
                            <br />
                            <small>
                              {b.resourceType?.replace("_", " ")}{" "}
                              {b.resourceLocation ? `· ${b.resourceLocation}` : ""}
                            </small>
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{b.bookingDate}</td>
                        <td style={{ whiteSpace: "nowrap", fontSize: ".82rem" }}>
                          {b.startTime} – {b.endTime}
                        </td>
                        <td style={{ maxWidth: 180 }}>{b.purpose}</td>
                        <td>{statusBadge(b.status)}</td>
                        <td
                          style={{
                            fontSize: ".8rem",
                            color: "#64748b",
                            maxWidth: 160,
                          }}
                        >
                          {b.adminReason || (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        <td>
                          <div className="td-actions">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => setDetailModal(b)}
                            >
                              View
                            </button>

                            {(b.status === "APPROVED" || b.status === "PENDING") && (
                              <button
                                className="btn btn-danger btn-xs"
                                onClick={() => {
                                  setCancelModal(b);
                                  setCancelReason("");
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {detailModal && (
            <div className="modal-overlay" onClick={() => setDetailModal(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title">
                    Booking Details #{detailModal.id}
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setDetailModal(null)}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  {statusBadge(detailModal.status)}
                </div>

                <div className="booking-detail-grid">
                  <div className="detail-row">
                    <div className="detail-label">Resource</div>
                    <div className="detail-value">{detailModal.resourceName}</div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-label">Type</div>
                    <div className="detail-value">
                      {detailModal.resourceType?.replace("_", " ")}
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">
                      {detailModal.resourceLocation || "—"}
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-label">Date</div>
                    <div className="detail-value">{detailModal.bookingDate}</div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-label">Time</div>
                    <div className="detail-value">
                      {detailModal.startTime} – {detailModal.endTime}
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-label">Attendees</div>
                    <div className="detail-value">
                      {detailModal.expectedAttendees || "—"}
                    </div>
                  </div>

                  <div className="detail-row detail-full">
                    <div className="detail-label">Purpose</div>
                    <div className="detail-value">{detailModal.purpose}</div>
                  </div>

                  {detailModal.adminReason && (
                    <div className="detail-row detail-full">
                      <div className="detail-label">Admin Note</div>
                      <div className="detail-value">{detailModal.adminReason}</div>
                    </div>
                  )}

                  <div className="detail-row">
                    <div className="detail-label">Submitted</div>
                    <div className="detail-value" style={{ fontSize: ".82rem" }}>
                      {new Date(detailModal.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDetailModal(null)}
                  >
                    Close
                  </button>

                  {(detailModal.status === "APPROVED" ||
                    detailModal.status === "PENDING") && (
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setDetailModal(null);
                        setCancelModal(detailModal);
                        setCancelReason("");
                      }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {cancelModal && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <div className="modal-title">Cancel Booking</div>
                  <button
                    className="modal-close"
                    onClick={() => setCancelModal(null)}
                  >
                    ✕
                  </button>
                </div>

                <div className="resource-preview">
                  <strong>{cancelModal.resourceName}</strong>
                  <span style={{ color: "#64748b", fontSize: ".85rem" }}>
                    {cancelModal.bookingDate} · {cancelModal.startTime}–
                    {cancelModal.endTime}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason (optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Why are you cancelling?"
                  />
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCancelModal(null)}
                  >
                    Back
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={handleCancel}
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyBookings;