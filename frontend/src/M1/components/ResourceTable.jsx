import React from "react";

function ResourceTable({ resources, onEdit, onDelete, loading }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Availability Window</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resources.map((resource) => (
              <tr
                key={resource.id}
                className="text-slate-700 transition hover:bg-slate-50"
              >
                <td className="px-4 py-3 font-medium text-slate-900">{resource.id}</td>
                <td className="px-4 py-3">{resource.name}</td>
                <td className="px-4 py-3">{resource.capacity}</td>
                <td className="px-4 py-3">{resource.location}</td>
                <td className="px-4 py-3">{resource.availabilityWindow}</td>
                <td className="px-4 py-3">{resource.type}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      resource.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {resource.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onEdit(resource)}
                      className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(resource.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading && resources.length === 0 && (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          No resources found.
        </div>
      )}
      {loading && (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          Loading resources...
        </div>
      )}
    </div>
  );
}

export default ResourceTable;
