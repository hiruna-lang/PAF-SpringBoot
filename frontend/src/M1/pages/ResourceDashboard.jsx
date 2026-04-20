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
    const active = resources.filter((item) => item.status === "ACTIVE").length;
    const outOfService = resources.filter(
      (item) => item.status === "OUT_OF_SERVICE"
    ).length;

    const byType = typeOptions.map((type) => ({
      type,
      count: resources.filter((item) => item.type === type).length,
    }));

    return { total, active, outOfService, byType };
  }, [resources]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="text-sm text-slate-500">
            Snapshot of campus resources and availability.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentPage("create")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Create Resource
          </button>
          <button
            onClick={() => setCurrentPage("view")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Resources
          </button>
        </div>
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
        {loading && <span className="text-slate-400">Refreshing...</span>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {loading ? "..." : totals.total}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Active</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">
            {loading ? "..." : totals.active}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Out of Service
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-600">
            {loading ? "..." : totals.outOfService}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">By Type</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {totals.byType.map((item) => (
            <div
              key={item.type}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase text-slate-400">
                {item.type}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {loading ? "..." : item.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResourceDashboard;
