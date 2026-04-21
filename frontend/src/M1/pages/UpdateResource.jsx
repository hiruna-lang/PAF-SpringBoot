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
    if (message.type !== "success") return undefined;
    const id = setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    return () => clearTimeout(id);
  }, [message.type]);

  if (!selectedResource) {
    return (
      <div className="m1-page">
        <h2 className="m1-page-title">Update Resource</h2>
        <p className="m1-page-sub">Please select a resource to update from View Resources.</p>
        <div>
          <button className="m1-btn-secondary" onClick={() => setCurrentPage("view")}>
            Go to View Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="m1-page">
      <div className="m1-page-header">
        <div>
          <h2 className="m1-page-title">Update Resource</h2>
          <p className="m1-page-sub">Editing resource ID {selectedResource.id}.</p>
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
