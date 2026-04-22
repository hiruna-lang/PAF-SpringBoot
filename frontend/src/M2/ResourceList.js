import React, { useCallback, useEffect, useMemo, useState } from "react";
import { fetchResources } from "./bookingService";

const TYPE_ICONS = {
  ROOM: "🏫",
  LAB: "🔬",
  EQUIPMENT: "📹",
  SPORTS_FACILITY: "⚽",
  AUDITORIUM: "🎭",
  LECTURE_HALL: "🏛",
  MEETING_ROOM: "🤝",
};

const TYPE_OPTIONS = ["", "ROOM", "LAB", "EQUIPMENT", "SPORTS_FACILITY", "AUDITORIUM", "LECTURE_HALL", "MEETING_ROOM"];
const STATUS_OPTIONS = ["", "ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];

const STATUS_BADGE = {
  ACTIVE: "badge badge-active",
  OUT_OF_SERVICE: "badge badge-out-of-service",
  MAINTENANCE: "badge badge-maintenance",
};

function ResourceList({ onBook, onToast, adminMode }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [minCapacity, setMinCapacity] = useState("");

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (keyword.trim()) params.keyword = keyword.trim();
      if (type) params.type = type;
      if (status) params.status = status;
      if (minCapacity) params.minCapacity = Number(minCapacity);

      const data = await fetchResources(params);
      setResources(data);
    } catch (e) {
      const message = e?.message || "Failed to load resources";
      setError(message);
      if (onToast) onToast("error", message);
    } finally {
      setLoading(false);
    }
  }, [keyword, type, status, minCapacity, onToast]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const activeCount = useMemo(() => resources.filter(r => r.status === "ACTIVE").length, [resources]);

  const handleBook = (resource) => {
    if (!resource || resource.status !== "ACTIVE") return;
    if (onBook) onBook(resource);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Resources</div>
          <div className="page-subtitle">Browse available facilities and request a booking.</div>
        </div>
        <div className="badge badge-active">{activeCount} Active</div>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input
            type="text"
            placeholder="Keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_OPTIONS.map(option => (
              <option key={option || "all"} value={option}>
                {option ? option.replace(/_/g, " ") : "All"}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map(option => (
              <option key={option || "all"} value={option}>
                {option ? option.replace(/_/g, " ") : "All"}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Min Capacity</label>
          <input
            type="number"
            min="0"
            placeholder="Any"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={loadResources} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      {loading && !resources.length ? (
        <div className="alert alert-info">
          <span className="alert-icon">⏳</span>
          Loading resources...
        </div>
      ) : null}

      {!loading && !resources.length ? (
        <div className="alert alert-info">
          <span className="alert-icon">ℹ</span>
          No resources matched the current filters.
        </div>
      ) : null}

      <div className="resource-grid">
        {resources.map((resource) => {
          const statusClass = STATUS_BADGE[resource.status] || "badge";
          const isBookable = resource.status === "ACTIVE" && !adminMode;

          return (
            <div
              key={resource.id}
              className={`resource-card ${resource.status === "OUT_OF_SERVICE" ? "out-of-service" : ""} ${resource.status === "MAINTENANCE" ? "maintenance" : ""}`}
            >
              <div className="resource-card-header">
                <div>
                  <div className="resource-card-title">
                    {TYPE_ICONS[resource.type] || "🏢"} {resource.name}
                  </div>
                </div>
                <div className="resource-type-pill">
                  {resource.type ? resource.type.replace(/_/g, " ") : "RESOURCE"}
                </div>
              </div>

              <div className="resource-card-body">
                {resource.location && (
                  <div className="resource-meta-row">
                    <span className="resource-meta-icon">📍</span>
                    <span>{resource.location}</span>
                  </div>
                )}
                {resource.capacity && (
                  <div className="resource-meta-row">
                    <span className="resource-meta-icon">👥</span>
                    <span>{resource.capacity} capacity</span>
                  </div>
                )}
                {resource.description && (
                  <div className="resource-desc">{resource.description}</div>
                )}
                {resource.availabilityNote && (
                  <div className="resource-avail-note">🕐 {resource.availabilityNote}</div>
                )}
              </div>

              <div className="resource-card-footer">
                <span className={statusClass}>{resource.status?.replace(/_/g, " ") || "Status"}</span>
                <button className="btn btn-primary btn-sm" onClick={() => handleBook(resource)} disabled={!isBookable}>
                  Book
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ResourceList;
