import React, { useCallback, useEffect, useState } from "react";
import ResourceFilters from "../components/ResourceFilters";
import ResourceTable from "../components/ResourceTable";
import {
  deleteResource,
  getAllResources,
  getResourcesByCapacity,
  getResourcesByLocation,
  getResourcesByStatus,
  getResourcesByType,
} from "../services/resourceApi";

function ViewResources({ setCurrentPage, setSelectedResource }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeFilter, setActiveFilter] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const setSuccess = (text) => setMessage({ type: "success", text });
  const setError = (text) => setMessage({ type: "error", text });

  const loadAllResources = useCallback(async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const data = await getAllResources();
      setResources(Array.isArray(data) ? data : []);
      setActiveFilter(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllResources(); }, [loadAllResources]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!activeFilter) loadAllResources();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [activeFilter, loadAllResources]);

  useEffect(() => {
    if (message.type !== "success") return undefined;
    const id = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    return () => clearTimeout(id);
  }, [message.type]);

  const handleFilter = async (fetcher, value, filterType) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const data = await fetcher(value);
      setResources(Array.isArray(data) ? data : []);
      setSuccess("Filter applied.");
      setActiveFilter({ type: filterType, value });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || "Failed to filter resources.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resource?")) return;
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await deleteResource(id);
      setSuccess("Resource deleted.");
      await loadAllResources();
    } catch (err) {
      setError(err.message || "Failed to delete resource.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setCurrentPage("update");
  };

  return (
    <div className="m1-page">
      <div className="m1-page-header">
        <div>
          <h2 className="m1-page-title">View Resources</h2>
          <p className="m1-page-sub">Browse, filter, and manage all resources.</p>
        </div>
        <button className="m1-btn-primary" onClick={() => setCurrentPage("create")}>
          Add Resource
        </button>
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
        {activeFilter && (
          <span className="m1-filter-badge">Filter: {activeFilter.type}</span>
        )}
      </div>

      <ResourceFilters
        onFilterByType={(v) => handleFilter(getResourcesByType, v, "type")}
        onFilterByLocation={(v) => handleFilter(getResourcesByLocation, v, "location")}
        onFilterByCapacity={(v) => handleFilter(getResourcesByCapacity, v, "capacity")}
        onFilterByStatus={(v) => handleFilter(getResourcesByStatus, v, "status")}
        onReset={loadAllResources}
        autoReset
      />

      {message.text && (
        <div className={`m1-alert ${message.type}`}>{message.text}</div>
      )}

      <ResourceTable
        resources={resources}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={loading}
      />
    </div>
  );
}

export default ViewResources;
