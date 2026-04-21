import React, { useEffect, useState } from "react";
import ResourceForm from "../components/ResourceForm";
import { createResource } from "../services/resourceApi";

function CreateResource({ setCurrentPage }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formKey, setFormKey] = useState(0);
  const draftKey = "m1-resource-draft";

  const setSuccess = (text) => setMessage({ type: "success", text });
  const setError = (text) => setMessage({ type: "error", text });

  const handleSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await createResource(data);
      setSuccess("Resource created successfully.");
      setFormKey((prev) => prev + 1);
      localStorage.removeItem(draftKey);
    } catch (err) {
      setError(err.message || "Failed to create resource.");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Create Resource</h2>
          <p className="text-sm text-slate-500">
            Add a new campus resource to the system.
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
          key={formKey}
          initialData={{}}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Add Resource"
          enableDraft
          draftKey={draftKey}
        />
      </div>
    </div>
  );
}

export default CreateResource;
