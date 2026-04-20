import React, { useEffect, useState } from "react";
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

  const loadAllResources = async () => {
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
  };

  useEffect(() => {
    loadAllResources();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!activeFilter) {
        loadAllResources();
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [activeFilter]);

  useEffect(() => {
    if (message.type !== "success") {
      return undefined;
    }
    const timeoutId = setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
    return () => clearTimeout(timeoutId);
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
    const confirmed = window.confirm("Delete this resource?");
    if (!confirmed) {
      return;
    }

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

  const messageStyles =
    message.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">View Resources</h2>
          <p className="text-sm text-slate-500">
            Browse, filter, and manage all resources.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage("create")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Add Resource
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>
          Auto-refresh every 30 seconds
          {lastUpdated && (
            <span className="ml-2 text-slate-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </span>
        {activeFilter && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Filter: {activeFilter.type}
          </span>
        )}
      </div>

      <ResourceFilters
        onFilterByType={(value) =>
          handleFilter(getResourcesByType, value, "type")
        }
        onFilterByLocation={(value) =>
          handleFilter(getResourcesByLocation, value, "location")
        }
        onFilterByCapacity={(value) =>
          handleFilter(getResourcesByCapacity, value, "capacity")
        }
        onFilterByStatus={(value) =>
          handleFilter(getResourcesByStatus, value, "status")
        }
        onReset={loadAllResources}
        autoReset
      />

      {message.text && (
        <div className={`rounded-xl border px-4 py-2 text-sm ${messageStyles}`}>
          {message.text}
        </div>
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
