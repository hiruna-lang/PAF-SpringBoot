import React, { useEffect, useState } from "react";
import ResourceForm from "../components/ResourceForm";
import { updateResource } from "../services/resourceApi";

function UpdateResource({ selectedResource, setCurrentPage }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const setSuccess = (text) => setMessage({ type: "success", text });
  const setError = (text) => setMessage({ type: "error", text });

  const handleSubmit = async (data) => {
    if (!selectedResource || !selectedResource.id) {
      setError("Please select a resource to update from View Resources.");
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await updateResource(selectedResource.id, data);
      setSuccess("Resource updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update resource.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message.type !== "success") {
      return undefined;
    }
    const timeoutId = setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [message.type]);

  const messageStyles =
    message.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  if (!selectedResource) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">Update Resource</h2>
        <p className="text-sm text-slate-600">
          Please select a resource to update from View Resources.
        </p>
        <button
          onClick={() => setCurrentPage("view")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Go to View Resources
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Update Resource</h2>
          <p className="text-sm text-slate-500">
            Editing resource ID {selectedResource.id}.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage("view")}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to View
        </button>
      </div>

      {message.text && (
        <div className={`rounded-xl border px-4 py-2 text-sm ${messageStyles}`}>
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ResourceForm
          initialData={selectedResource}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Update Resource"
          enableDraft={false}
        />
      </div>
    </div>
  );
}

export default UpdateResource;
