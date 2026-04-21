import React from "react";

function ResourceDetails({ resource, setCurrentPage }) {
  if (!resource) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Resource Details</h2>
        <p className="text-sm text-slate-600">
          No resource selected.
        </p>
        <button
          onClick={() => setCurrentPage("view")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to View
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Resource Details</h2>
          <p className="text-sm text-slate-500">
            Detailed view for resource ID {resource.id}.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage("view")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to View
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Resource</p>
            <p className="text-lg font-semibold text-slate-900">{resource.name}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              resource.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {resource.status}
          </span>
        </div>

        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Name</dt>
            <dd className="text-sm font-semibold text-slate-900">{resource.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Capacity</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {resource.capacity}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Location</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {resource.location}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">
              Availability Window
            </dt>
            <dd className="text-sm font-semibold text-slate-900">
              {resource.availabilityWindow}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Type</dt>
            <dd className="text-sm font-semibold text-slate-900">{resource.type}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase text-slate-400">Status</dt>
            <dd className="text-sm font-semibold text-slate-900">
              {resource.status}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default ResourceDetails;
