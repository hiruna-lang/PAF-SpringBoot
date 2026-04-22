import React, { useEffect, useState, useCallback } from "react";
import { fetchAllBookings, fetchAnalytics, approveBooking, rejectBooking, cancelBooking } from "./bookingService";

const STATUS_COLORS = {
  PENDING:   "badge-pending",
  APPROVED:  "badge-approved",
  REJECTED:  "badge-rejected",
  CANCELLED: "badge-cancelled"
};
const STATUS_OPTS = ["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function statusBadge(s) {
  return <span className={`badge ${STATUS_COLORS[s] || ""}`}>{s}</span>;
}

function AdminBookings({ onToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [analytics, setAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [actionModal, setActionModal] = useState(null); // { booking, action }
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBookings(filter || null);
      setBookings(data);
    } catch (e) {
      onToast("error", e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, onToast]);

  useEffect(() => { load(); }, [load]);

  const loadAnalytics = async () => {
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (e) {
      onToast("error", e.message);
    }
  };

  const handleAction = async () => {
    const { booking, action } = actionModal;
    if (action === "reject" && !reason.trim()) { onToast("error", "Rejection reason is required"); return; }
    setActionLoading(true);
    try {
      if (action === "approve")      await approveBooking(booking.id, reason);
      else if (action === "reject")  await rejectBooking(booking.id, reason);
      else if (action === "cancel")  await cancelBooking(booking.id, reason);
      setActionModal(null);
      setReason("");
      const pastTense = action === "approve" ? "approved" : action === "reject" ? "rejected" : "cancelled";
      onToast("success", `Booking #${booking.id} ${pastTense}.`);
      load();
    } catch (e) {
      onToast("error", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const counts = bookings.reduce((a, b) => { a[b.status] = (a[b.status] || 0) + 1; return a; }, {});
  const maxTop = analytics?.topResources?.[0]?.bookingCount || 1;

  const ACTION_BTN = { approve: "btn-success", reject: "btn-danger", cancel: "btn-warning" };
  const ACTION_ICON = { approve: "✓", reject: "✕", cancel: "⊘" };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Bookings</div>
          <div className="page-subtitle">Review, approve or reject booking requests</div>
        </div>
        <div style={{ display: "flex", gap: ".5rem" }}>
          <button className="btn btn-outline btn-sm" onClick={loadAnalytics}>📊 Analytics</button>
          <button className="btn btn-secondary btn-sm" onClick={load}>↺ Refresh</button>
        </div>
      </div>

      {/* Analytics panel */}
      {showAnalytics && analytics && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div className="section-header">
            <div className="section-title">📊 Booking Analytics</div>
            <button className="btn btn-ghost btn-xs" onClick={() => setShowAnalytics(false)}>✕ Close</button>
          </div>
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-big">{analytics.totalBookings}</div>
              <div className="analytics-label">Total Bookings</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-big" style={{ color: "#f97316" }}>{analytics.pendingCount}</div>
              <div className="analytics-label">Awaiting Review</div>
            </div>
            <div className="analytics-card">
              <div className="analytics-big" style={{ color: "#22c55e" }}>{analytics.approvedTodayCount}</div>
              <div className="analytics-label">Approved Today</div>
            </div>
            {analytics.statusBreakdown && Object.entries(analytics.statusBreakdown).map(([s, c]) => (
              <div className="analytics-card" key={s}>
                <div className="analytics-big">{c}</div>
                <div className="analytics-label">{statusBadge(s)}</div>
              </div>
            ))}
          </div>

          {analytics.topResources?.length > 0 && (
            <>
              <div className="section-title" style={{ marginBottom: ".75rem" }}>🏆 Top Resources (by approved bookings)</div>
              <table className="top-resources-table">
                <tbody>
                  {analytics.topResources.map((r, i) => (
                    <tr key={r.resourceId}>
                      <td style={{ width: 28, color: "#94a3b8", fontSize: ".8rem" }}>#{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.resourceName}</td>
                      <td style={{ width: 200 }}>
                        <div className="top-bar-wrap">
                          <div className="top-bar-fill" style={{ width: `${(r.bookingCount / maxTop) * 100}%` }} />
                        </div>
                      </td>
                      <td style={{ width: 50, textAlign: "right", fontWeight: 700, color: "#1e40af" }}>{r.bookingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        {["PENDING","APPROVED","REJECTED","CANCELLED"].map(s => (
          <div className={`stat-card ${s.toLowerCase()}`} key={s}>
            <div className="stat-card-top">
              <div className="stat-icon">{s==="PENDING"?"⏳":s==="APPROVED"?"✅":s==="REJECTED"?"❌":"🚫"}</div>
            </div>
            <div className="stat-num">{counts[s] || 0}</div>
            <div className="stat-label">{s}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
        <span style={{ fontSize: ".8rem", fontWeight: 600, color: "#64748b" }}>Filter:</span>
        {STATUS_OPTS.map(s => (
          <button
            key={s || "all"}
            className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(s)}
          >
            {s || "All"} {s && counts[s] ? `(${counts[s]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">No bookings match this filter</div>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Att.</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ color: "#94a3b8", fontSize: ".8rem" }}>{b.id}</td>
                    <td>
                      <div className="td-user">
                        <strong>{b.userName}</strong>
                        <br /><small>{b.userEmail}</small>
                      </div>
                    </td>
                    <td>
                      <div className="td-resource">
                        <strong>{b.resourceName}</strong>
                        <br /><small>{b.resourceType?.replace("_"," ")}</small>
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: ".85rem" }}>{b.bookingDate}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: ".82rem" }}>{b.startTime}–{b.endTime}</td>
                    <td style={{ maxWidth: 160, fontSize: ".85rem" }}>{b.purpose}</td>
                    <td style={{ fontSize: ".85rem" }}>{b.expectedAttendees || "—"}</td>
                    <td>{statusBadge(b.status)}</td>
                    <td style={{ fontSize: ".78rem", color: "#64748b", maxWidth: 130 }}>{b.adminReason || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs" onClick={() => setDetailModal(b)}>View</button>
                        {b.status === "PENDING" && (
                          <>
                            <button className="btn btn-success btn-xs" onClick={() => { setActionModal({ booking: b, action: "approve" }); setReason(""); }}>✓</button>
                            <button className="btn btn-danger btn-xs" onClick={() => { setActionModal({ booking: b, action: "reject" }); setReason(""); }}>✕</button>
                          </>
                        )}
                        {(b.status === "APPROVED" || b.status === "PENDING") && (
                          <button className="btn btn-warning btn-xs" onClick={() => { setActionModal({ booking: b, action: "cancel" }); setReason(""); }}>⊘</button>
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

      {/* Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Booking #{detailModal.id}</div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div style={{ marginBottom: "1rem" }}>{statusBadge(detailModal.status)}</div>
            <div className="booking-detail-grid">
              <div className="detail-row"><div className="detail-label">User</div><div className="detail-value">{detailModal.userName}</div></div>
              <div className="detail-row"><div className="detail-label">Email</div><div className="detail-value" style={{ fontSize: ".85rem" }}>{detailModal.userEmail}</div></div>
              <div className="detail-row"><div className="detail-label">Resource</div><div className="detail-value">{detailModal.resourceName}</div></div>
              <div className="detail-row"><div className="detail-label">Location</div><div className="detail-value">{detailModal.resourceLocation || "—"}</div></div>
              <div className="detail-row"><div className="detail-label">Date</div><div className="detail-value">{detailModal.bookingDate}</div></div>
              <div className="detail-row"><div className="detail-label">Time</div><div className="detail-value">{detailModal.startTime} – {detailModal.endTime}</div></div>
              <div className="detail-row"><div className="detail-label">Attendees</div><div className="detail-value">{detailModal.expectedAttendees || "—"}</div></div>
              <div className="detail-row"><div className="detail-label">Submitted</div><div className="detail-value" style={{ fontSize: ".82rem" }}>{new Date(detailModal.createdAt).toLocaleString()}</div></div>
              <div className="detail-row detail-full"><div className="detail-label">Purpose</div><div className="detail-value">{detailModal.purpose}</div></div>
              {detailModal.adminReason && (
                <div className="detail-row detail-full"><div className="detail-label">Admin Note</div><div className="detail-value">{detailModal.adminReason}</div></div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailModal(null)}>Close</button>
              {detailModal.status === "PENDING" && (
                <>
                  <button className="btn btn-success" onClick={() => { setDetailModal(null); setActionModal({ booking: detailModal, action: "approve" }); setReason(""); }}>Approve</button>
                  <button className="btn btn-danger" onClick={() => { setDetailModal(null); setActionModal({ booking: detailModal, action: "reject" }); setReason(""); }}>Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title" style={{ textTransform: "capitalize" }}>
                {ACTION_ICON[actionModal.action]} {actionModal.action} Booking #{actionModal.booking.id}
              </div>
              <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
            </div>
            <div className="resource-preview">
              <div style={{ fontWeight: 700, width: "100%" }}>{actionModal.booking.resourceName}</div>
              <span style={{ color: "#64748b", fontSize: ".85rem" }}>{actionModal.booking.userName} ({actionModal.booking.userEmail})</span>
              <span style={{ color: "#64748b", fontSize: ".85rem" }}>{actionModal.booking.bookingDate} · {actionModal.booking.startTime}–{actionModal.booking.endTime}</span>
              <span style={{ color: "#475569", fontSize: ".85rem", width: "100%" }}>Purpose: {actionModal.booking.purpose}</span>
            </div>
            <div className="form-group">
              <label className="form-label">
                Reason {actionModal.action === "reject" ? <span className="required">*</span> : "(optional)"}
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={
                  actionModal.action === "approve" ? "Optional notes for the requester..."
                  : actionModal.action === "reject" ? "Reason for rejection (required)..."
                  : "Reason for cancellation..."
                }
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActionModal(null)}>Back</button>
              <button
                className={`btn ${ACTION_BTN[actionModal.action]}`}
                onClick={handleAction}
                disabled={actionLoading || (actionModal.action === "reject" && !reason.trim())}
                style={{ textTransform: "capitalize" }}
              >
                {actionLoading ? "Processing..." : `${actionModal.action} Booking`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
