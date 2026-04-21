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
    if (message.type !== "success") return undefined;
    const id = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    return () => clearTimeout(id);
  }, [message.type]);

  return (
    <div className="m1-page">
      <div className="m1-page-header">
        <div>
          <h2 className="m1-page-title">Create Resource</h2>
          <p className="m1-page-sub">Add a new campus resource to the system.</p>
        </div>
        <button className="m1-btn-secondary" onClick={() => setCurrentPage("view")}>
          Back to View
        </button>
      </div>

      {message.text && (
        <div className={`m1-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="m1-card-lg">
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
