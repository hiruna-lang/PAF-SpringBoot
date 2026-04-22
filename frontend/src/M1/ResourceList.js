import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchResources } from "../M2/bookingService";
import "./ResourceList.css";

const TYPES = ["ROOM", "LAB", "EQUIPMENT", "SPORTS_FACILITY", "AUDITORIUM"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];

const TYPE_ICONS = {
  ROOM: "🏫", LAB: "🔬", EQUIPMENT: "📹", SPORTS_FACILITY: "⚽", AUDITORIUM: "🎭"
};

function resourceStatusBadge(status) {
  const cls = {
    ACTIVE: "badge-active",
    OUT_OF_SERVICE: "badge-out-of-service",
    MAINTENANCE: "badge-maintenance"
  };
  const label = status?.replace(/_/g, " ") || "";
  return <span className={`badge ${cls[status] || ""}`}>{label}</span>;
}

function ResourceListPage() {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [minCapacity, setMinCapacity] = useState("");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (filterType)     params.type = filterType;
      if (filterStatus)   params.status = filterStatus;
      if (minCapacity)    params.minCapacity = parseInt(minCapacity);
      const data = await fetchResources(params);
      setResources(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, filterType, filterStatus, minCapacity]);

  useEffect(() => { load(); }, [load]);

  const handleBook = (r) => {
    navigate("/m2", { state: { bookResource: r } });
  };

  const activeCount = resources.filter(r => r.status === "ACTIVE").length;

  return (
    <div className="rl-page">

      {/* ── Navbar ── */}
      <nav className="rl-nav">
        <button className="rl-nav-back" onClick={() => navigate("/")} title="Back to Home">
          ← Home
        </button>
        <div className="rl-nav-brand">
          <span className="rl-nav-brand-icon">SC</span>
          <span className="rl-nav-brand-name">Campus Resources</span>
        </div>
        <div className="rl-nav-actions">
          <button className="rl-btn rl-btn-secondary" onClick={() => navigate("/m2")}>
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
            <input
              className="rl-input"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Name or location..."
            />
          </div>
          <div className="rl-filter-group">
            <span className="rl-filter-label">Type</span>
            <select className="rl-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {TYPES.map(t => (
                <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div className="rl-filter-group">
            <span className="rl-filter-label">Status</span>
            <select className="rl-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div className="rl-filter-group">
            <span className="rl-filter-label">Min Capacity</span>
            <input
              className="rl-input rl-input-sm"
              type="number"
              min="1"
              value={minCapacity}
              onChange={e => setMinCapacity(e.target.value)}
              placeholder="e.g. 30"
            />
          </div>
          <button className="rl-btn rl-btn-secondary rl-btn-sm" onClick={load}>
            ↺ Refresh
          </button>
          {(keyword || filterType || filterStatus || minCapacity) && (
            <button
              className="rl-btn rl-btn-ghost rl-btn-sm"
              onClick={() => {
                setKeyword("");
                setFilterType("");
                setFilterStatus("");
                setMinCapacity("");
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rl-alert rl-alert-error">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Resource grid ── */}
        {loading ? (
          <div className="rl-loading">
            <div className="rl-spinner" />
            <span>Loading resources...</span>
          </div>
        ) : resources.length === 0 ? (
          <div className="rl-empty">
            <div className="rl-empty-icon">🏢</div>
            <div className="rl-empty-title">No resources found</div>
            <div className="rl-empty-sub">Try adjusting your filters</div>
          </div>
        ) : (
          <div className="rl-grid">
            {resources.map(r => (
              <div
                key={r.id}
                className={`rl-card ${
                  r.status === "OUT_OF_SERVICE" ? "rl-card-disabled" :
                  r.status === "MAINTENANCE"    ? "rl-card-maintenance" : ""
                }`}
              >
                <div className="rl-card-header">
                  <div>
                    <span className="rl-type-pill">
                      {TYPE_ICONS[r.type]} {r.type.replace(/_/g, " ")}
                    </span>
                    <div className="rl-card-title">{r.name}</div>
                  </div>
                  {resourceStatusBadge(r.status)}
                </div>

                <div className="rl-card-body">
                  {r.location && (
                    <div className="rl-meta-row">
                      <span>📍</span><span>{r.location}</span>
                    </div>
                  )}
                  {r.capacity && (
                    <div className="rl-meta-row">
                      <span>👥</span>
                      <span>Capacity: <strong>{r.capacity}</strong></span>
                    </div>
                  )}
                  {r.description && <p className="rl-desc">{r.description}</p>}
                  {r.availabilityNote && (
                    <p className="rl-avail">🕐 {r.availabilityNote}</p>
                  )}
                </div>

                <div className="rl-card-footer">
                  {r.status === "ACTIVE" ? (
                    <button
                      className="rl-btn rl-btn-book"
                      onClick={() => handleBook(r)}
                    >
                      📅 Book Now
                    </button>
                  ) : (
                    <div className="rl-unavailable">
                      <span className="rl-unavailable-icon">
                        {r.status === "MAINTENANCE" ? "🔧" : "🚫"}
                      </span>
                      <span>
                        {r.status === "MAINTENANCE"
                          ? "Under maintenance"
                          : "Currently unavailable"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResourceListPage;
