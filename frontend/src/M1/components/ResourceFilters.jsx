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
  const [filters, setFilters] = useState({
    type: "",
    location: "",
    capacity: "",
    status: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const runFilter = (value, callback, label) => {
    if (!value) {
      setMessage(`Please enter ${label} to search.`);
      return;
    }
    if (label === "a capacity") {
      const capacityValue = Number(value);
      if (!Number.isInteger(capacityValue) || capacityValue <= 0) {
        setMessage("Capacity must be a positive whole number.");
        return;
      }
    }
    setMessage("");
    callback(value);
    if (autoReset) {
      setFilters({ type: "", location: "", capacity: "", status: "" });
    }
  };

  const handleReset = () => {
    setFilters({ type: "", location: "", capacity: "", status: "" });
    setMessage("");
    onReset();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Filters</h3>
          <p className="text-xs text-slate-500">
            Run one filter at a time for accurate results.
          </p>
        </div>
        {message && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {message}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Type</label>
          <div className="flex flex-wrap gap-2">
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select type</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              onClick={() => runFilter(filters.type, onFilterByType, "a type")}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Location</label>
          <div className="flex flex-wrap gap-2">
            <input
              name="location"
              value={filters.location}
              onChange={handleChange}
              className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="Building / Room"
            />
            <button
              onClick={() =>
                runFilter(filters.location, onFilterByLocation, "a location")
              }
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">
            Minimum Capacity
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              name="capacity"
              type="number"
              min="1"
              step="1"
              value={filters.capacity}
              onChange={handleChange}
              className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="e.g. 50"
            />
            <button
              onClick={() =>
                runFilter(filters.capacity, onFilterByCapacity, "a capacity")
              }
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Status</label>
          <div className="flex flex-wrap gap-2">
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button
              onClick={() => runFilter(filters.status, onFilterByStatus, "a status")}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={handleReset}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
        {autoReset && (
          <span className="text-xs text-slate-400">
            Filters reset automatically after search.
          </span>
        )}
      </div>
    </div>
  );
}

export default ResourceFilters;
