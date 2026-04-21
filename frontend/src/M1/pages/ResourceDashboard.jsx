import React, { useEffect, useMemo, useState } from "react";
import { getAllResources } from "../services/resourceApi";

const typeOptions = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

function ResourceDashboard({ setCurrentPage }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllResources();
        setResources(Array.isArray(data) ? data : []);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message || "Failed to load resources.");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
    const intervalId = setInterval(loadResources, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const totals = useMemo(() => {
    const total = resources.length;
    const active = resources.filter((r) => r.status === "ACTIVE").length;
    const outOfService = resources.filter((r) => r.status === "OUT_OF_SERVICE").length;
    const byType = typeOptions.map((type) => ({
      type,
      count: resources.filter((r) => r.type === type).length,
    }));
    return { total, active, outOfService, byType };
  }, [resources]);

  return (
    <div className="m1-page">
      <div className="m1-page-header">
        <div>
          <h2 className="m1-page-title">Dashboard</h2>
          <p className="m1-page-sub">Snapshot of campus resources and availability.</p>
        </div>
        <div className="m1-btn-group">
          <button className="m1-btn-primary" onClick={() => setCurrentPage("create")}>
            Create Resource
          </button>
          <button className="m1-btn-secondary" onClick={() => setCurrentPage("view")}>
            View Resources
          </button>
        </div>
      </div>

      <div className="m1-meta">
        <span>
          Auto-refresh every 30 seconds
          {lastUpdated && (
            <span className="m1-meta-muted">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </span>
        {loading && <span className="m1-meta-muted">Refreshing...</span>}
      </div>

      {error && <div className="m1-alert error">{error}</div>}

      <div className="m1-stats-grid">
        <div className="m1-card">
          <p className="m1-stat-label">Total</p>
          <p className="m1-stat-value">{loading ? "..." : totals.total}</p>
        </div>
        <div className="m1-card">
          <p className="m1-stat-label">Active</p>
          <p className="m1-stat-value emerald">{loading ? "..." : totals.active}</p>
        </div>
        <div className="m1-card">
          <p className="m1-stat-label">Out of Service</p>
          <p className="m1-stat-value amber">{loading ? "..." : totals.outOfService}</p>
        </div>
      </div>

      <div>
        <h3 className="m1-section-title">By Type</h3>
        <div className="m1-type-grid">
          {totals.byType.map((item) => (
            <div key={item.type} className="m1-card">
              <p className="m1-stat-label">{item.type}</p>
              <p className="m1-type-value">{loading ? "..." : item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResourceDashboard;
