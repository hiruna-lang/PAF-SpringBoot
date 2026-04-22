import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchResources, createBooking } from "../M2/bookingService";
import "./ResourceList.css";

const TYPES    = ["ROOM", "LAB", "EQUIPMENT", "SPORTS_FACILITY", "AUDITORIUM"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];

const TYPE_ICONS = {
  ROOM: "🏫", LAB: "🔬", EQUIPMENT: "📹", SPORTS_FACILITY: "⚽", AUDITORIUM: "🎭",
  LECTURE_HALL: "🏛", MEETING_ROOM: "🤝",
};

function statusBadge(status) {
  const map = {
    ACTIVE:          { cls: "rl-badge-active",    label: "Active" },
    OUT_OF_SERVICE:  { cls: "rl-badge-oos",       label: "Out of Service" },
    MAINTENANCE:     { cls: "rl-badge-maint",     label: "Maintenance" },
  };
  const { cls, label } = map[status] || { cls: "", label: status };
  return <span className={`rl-status-badge ${cls}`}>{label}</span>;
}

/* ─── Inline Booking Modal ─────────────────────────────────────────── */
function BookingModal({ resource, onClose, onSuccess }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    bookingDate: today,
    startTime: "09:00",
    endTime: "10:00",
    purpose: "",
    expectedAttendees: "",
  });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.purpose.trim())          { setError("Purpose is required"); return; }
    if (form.endTime <= form.startTime) { setError("End time must be after start time"); return; }
    if (form.bookingDate < today)       { setError("Booking date cannot be in the past"); return; }

    setLoading(true);
    try {
      const payload = {
        resourceId: resource.id,
        bookingDate: form.bookingDate,
        startTime:   form.startTime,
        endTime:     form.endTime,
        purpose:     form.purpose,
        ...(form.expectedAttendees ? { expectedAttendees: parseInt(form.expectedAttendees) } : {}),
      };
      const result = await createBooking(payload);
      onSuccess(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rl-modal-overlay" onClick={onClose}>
      <div className="rl-booking-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="rl-bm-header">
          <div className="rl-bm-header-left">
            <div className="rl-bm-icon">
              {TYPE_ICONS[resource.type] || "🏢"}
            </div>
            <div>
              <h2 className="rl-bm-title">Request Booking</h2>
              <p className="rl-bm-subtitle">Fill in the details below to submit your request</p>
            </div>
          </div>
          <button className="rl-bm-close" onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        {/* Resource card */}
        <div className="rl-bm-resource-card">
          <div className="rl-bm-resource-name">
            {TYPE_ICONS[resource.type] || "🏢"} {resource.name}
          </div>
          <div className="rl-bm-resource-meta">
            {resource.location && (
              <span className="rl-bm-meta-chip">📍 {resource.location}</span>
            )}
            {resource.capacity && (
              <span className="rl-bm-meta-chip">👥 Capacity: {resource.capacity}</span>
            )}
            {resource.type && (
              <span className="rl-bm-meta-chip rl-bm-type-chip">
                {resource.type.replace(/_/g, " ")}
              </span>
            )}
          </div>
          {resource.availabilityNote && (
            <div className="rl-bm-avail">🕐 {resource.availabilityNote}</div>
          )}
        </div>

        {/* Workflow steps */}
        <div className="rl-bm-workflow">
          <div className="rl-bm-step rl-bm-step-active">
            <span className="rl-bm-step-dot">1</span>
            <span>Pending</span>
          </div>
          <span className="rl-bm-step-arrow">→</span>
          <div className="rl-bm-step">
            <span className="rl-bm-step-dot">2</span>
            <span>Approved</span>
          </div>
          <span className="rl-bm-step-arrow">or</span>
          <div className="rl-bm-step rl-bm-step-reject">
            <span className="rl-bm-step-dot rl-bm-step-dot-reject">✕</span>
            <span>Rejected</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rl-bm-error">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rl-bm-form">

          <div className="rl-bm-field rl-bm-field-full">
            <label className="rl-bm-label">Date <span className="rl-bm-req">*</span></label>
            <input
              className="rl-bm-input"
              type="date"
              min={today}
              value={form.bookingDate}
              onChange={e => set("bookingDate", e.target.value)}
              required
            />
          </div>

          <div className="rl-bm-row">
            <div className="rl-bm-field">
              <label className="rl-bm-label">Start Time <span className="rl-bm-req">*</span></label>
              <input
                className="rl-bm-input"
                type="time"
                value={form.startTime}
                onChange={e => set("startTime", e.target.value)}
                required
              />
            </div>
            <div className="rl-bm-field">
              <label className="rl-bm-label">End Time <span className="rl-bm-req">*</span></label>
              <input
                className="rl-bm-input"
                type="time"
                value={form.endTime}
                onChange={e => set("endTime", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="rl-bm-field rl-bm-field-full">
            <label className="rl-bm-label">Purpose <span className="rl-bm-req">*</span></label>
            <textarea
              className="rl-bm-textarea"
              value={form.purpose}
              onChange={e => set("purpose", e.target.value)}
              placeholder="e.g. Weekly team standup, CS101 practical, Department meeting..."
              required
            />
          </div>

          {resource.capacity && (
            <div className="rl-bm-field rl-bm-field-full">
              <label className="rl-bm-label">Expected Attendees</label>
              <input
                className="rl-bm-input"
                type="number"
                min="1"
                max={resource.capacity}
                value={form.expectedAttendees}
                onChange={e => set("expectedAttendees", e.target.value)}
                placeholder={`1 – ${resource.capacity}`}
              />
              <span className="rl-bm-hint">Maximum capacity: {resource.capacity}</span>
            </div>
          )}

          {/* Footer */}
          <div className="rl-bm-footer">
            <button type="button" className="rl-bm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="rl-bm-btn-submit" disabled={loading}>
              {loading ? (
                <><span className="rl-bm-spinner" /> Submitting...</>
              ) : (
                <>📅 Submit Request</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
function ResourceListPage() {
  const navigate = useNavigate();

  const [resources,    setResources]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [toast,        setToast]        = useState(null);
  const [bookingFor,   setBookingFor]   = useState(null); // resource to book

  // Filters
  const [keyword,      setKeyword]      = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [minCapacity,  setMinCapacity]  = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (keyword.trim()) params.keyword     = keyword.trim();
      if (filterType)     params.type        = filterType;
      if (filterStatus)   params.status      = filterStatus;
      if (minCapacity)    params.minCapacity = parseInt(minCapacity);
      setResources(await fetchResources(params));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, filterType, filterStatus, minCapacity]);

  useEffect(() => { load(); }, [load]);

  const handleBookSuccess = (booking) => {
    setBookingFor(null);
    showToast("success", `Booking for "${booking.resourceName || bookingFor?.name}" submitted — awaiting admin approval.`);
  };

  const activeCount = resources.filter(r => r.status === "ACTIVE").length;

  return (
    <div className="rl-page">

      {/* ── Navbar ── */}
      <nav className="rl-nav">
        <button className="rl-nav-back" onClick={() => navigate("/")}>← Home</button>
        <div className="rl-nav-brand">
          <span className="rl-nav-brand-icon">SC</span>
          <span className="rl-nav-brand-name">Campus Resources</span>
        </div>
        <div className="rl-nav-actions">
          <button className="rl-btn rl-btn-secondary" onClick={() => navigate("/m2?tab=my-bookings")}> 
            📅 My Bookings
          </button>
        </div>
      </nav>

      {/* ── Toast ── */}
      {toast && (
        <div className={`rl-toast rl-toast-${toast.type}`}>
          {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"} {toast.message}
        </div>
      )}

      <div className="rl-container">

        {/* ── Page header ── */}
        <div className="rl-page-header">
          <div>
            <h1 className="rl-page-title">Campus Resources</h1>
            <p className="rl-page-sub">
              {loading
                ? "Loading..."
                : `${resources.length} result${resources.length !== 1 ? "s" : ""} · ${activeCount} active`}
            </p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="rl-filters">
          <div className="rl-filter-group">
            <span className="rl-filter-label">Search</span>
            <input className="rl-input" value={keyword}
              onChange={e => setKeyword(e.target.value)} placeholder="Name or location..." />
          </div>
          <div className="rl-filter-group">
            <span className="rl-filter-label">Type</span>
            <select className="rl-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="rl-filter-group">
            <span className="rl-filter-label">Status</span>
            <select className="rl-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div className="rl-filter-group">
            <span className="rl-filter-label">Min Capacity</span>
            <input className="rl-input rl-input-sm" type="number" min="1"
              value={minCapacity} onChange={e => setMinCapacity(e.target.value)} placeholder="e.g. 30" />
          </div>
          <button className="rl-btn rl-btn-secondary rl-btn-sm" onClick={load}>↺ Refresh</button>
          {(keyword || filterType || filterStatus || minCapacity) && (
            <button className="rl-btn rl-btn-ghost rl-btn-sm"
              onClick={() => { setKeyword(""); setFilterType(""); setFilterStatus(""); setMinCapacity(""); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {error && <div className="rl-alert rl-alert-error"><span>⚠</span> {error}</div>}

        {/* ── Grid ── */}
        {loading ? (
          <div className="rl-loading"><div className="rl-spinner" /><span>Loading resources...</span></div>
        ) : resources.length === 0 ? (
          <div className="rl-empty">
            <div className="rl-empty-icon">🏢</div>
            <div className="rl-empty-title">No resources found</div>
            <div className="rl-empty-sub">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="rl-grid">
            {resources.map(r => (
              <div key={r.id} className={`rl-card ${
                r.status === "OUT_OF_SERVICE" ? "rl-card-disabled" :
                r.status === "MAINTENANCE"    ? "rl-card-maintenance" : ""
              }`}>
                <div className="rl-card-header">
                  <div>
                    <span className="rl-type-pill">
                      {TYPE_ICONS[r.type] || "🏢"} {r.type?.replace(/_/g, " ")}
                    </span>
                    <div className="rl-card-title">{r.name}</div>
                  </div>
                  {statusBadge(r.status)}
                </div>

                <div className="rl-card-body">
                  {r.location && (
                    <div className="rl-meta-row"><span>📍</span><span>{r.location}</span></div>
                  )}
                  {r.capacity && (
                    <div className="rl-meta-row">
                      <span>👥</span><span>Capacity: <strong>{r.capacity}</strong></span>
                    </div>
                  )}
                  {r.description && <p className="rl-desc">{r.description}</p>}
                  {r.availabilityNote && <p className="rl-avail">🕐 {r.availabilityNote}</p>}
                </div>

                <div className="rl-card-footer">
                  {r.status === "ACTIVE" ? (
                    <button className="rl-btn rl-btn-book" onClick={() => setBookingFor(r)}>
                      📅 Book Now
                    </button>
                  ) : (
                    <div className="rl-unavailable">
                      <span>{r.status === "MAINTENANCE" ? "🔧" : "🚫"}</span>
                      <span>{r.status === "MAINTENANCE" ? "Under maintenance" : "Currently unavailable"}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Booking Modal (renders on THIS page, no navigation) ── */}
      {bookingFor && (
        <BookingModal
          resource={bookingFor}
          onClose={() => setBookingFor(null)}
          onSuccess={handleBookSuccess}
        />
      )}
    </div>
  );
}

export default ResourceListPage;
