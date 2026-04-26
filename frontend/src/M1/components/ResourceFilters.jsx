import React, { useState } from "react";

const typeOptions = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const statusOptions = ["ACTIVE", "OUT_OF_SERVICE"];

function ResourceFilters({
  onFilterByType,
  onFilterByLocation,
  onFilterByCapacity,
  onFilterByStatus,
  onReset,
  autoReset = true,
}) {
  const [filters, setFilters] = useState({ type: "", location: "", capacity: "", status: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const runFilter = (value, callback, label) => {
    if (!value) { setMessage(`Please enter ${label} to search.`); return; }
    if (label === "a capacity") {
      const n = Number(value);
      if (!Number.isInteger(n) || n <= 0) { setMessage("Capacity must be a positive whole number."); return; }
    }
    setMessage("");
    callback(value);
    if (autoReset) setFilters({ type: "", location: "", capacity: "", status: "" });
  };

  const handleReset = () => {
    setFilters({ type: "", location: "", capacity: "", status: "" });
    setMessage("");
    onReset();
  };

  return (
    <div className="m1-card">
      <div className="m1-filters-header">
        <div>
          <h3 className="m1-section-title" style={{ marginBottom: 2 }}>Filters</h3>
          <p className="m1-page-sub">Run one filter at a time for accurate results.</p>
        </div>
        {message && <span className="m1-alert warning" style={{ padding: "4px 12px" }}>{message}</span>}
      </div>

      <div className="m1-filters-grid">
        <div className="m1-filter-row">
          <label className="m1-filter-label">Type</label>
          <div className="m1-filter-input-row">
            <select name="type" value={filters.type} onChange={handleChange} className="m1-input">
              <option value="">Select type</option>
              {typeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <button className="m1-btn-dark" onClick={() => runFilter(filters.type, onFilterByType, "a type")}>
              Search
            </button>
          </div>
        </div>

        <div className="m1-filter-row">
          <label className="m1-filter-label">Location</label>
          <div className="m1-filter-input-row">
            <input name="location" value={filters.location} onChange={handleChange} className="m1-input" placeholder="Building / Room" />
            <button className="m1-btn-dark" onClick={() => runFilter(filters.location, onFilterByLocation, "a location")}>
              Search
            </button>
          </div>
        </div>

        <div className="m1-filter-row">
          <label className="m1-filter-label">Minimum Capacity</label>
          <div className="m1-filter-input-row">
            <input name="capacity" type="number" min="1" step="1" value={filters.capacity} onChange={handleChange} className="m1-input" placeholder="e.g. 50" />
            <button className="m1-btn-dark" onClick={() => runFilter(filters.capacity, onFilterByCapacity, "a capacity")}>
              Search
            </button>
          </div>
        </div>

        <div className="m1-filter-row">
          <label className="m1-filter-label">Status</label>
          <div className="m1-filter-input-row">
            <select name="status" value={filters.status} onChange={handleChange} className="m1-input">
              <option value="">Select status</option>
              {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <button className="m1-btn-dark" onClick={() => runFilter(filters.status, onFilterByStatus, "a status")}>
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="m1-filters-footer">
        <button className="m1-btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={handleReset}>
          Reset
        </button>
        {autoReset && <span className="m1-filters-hint">Filters reset automatically after search.</span>}
      </div>
    </div>
  );
}

export default ResourceFilters;
