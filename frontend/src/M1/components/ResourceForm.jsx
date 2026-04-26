import React, { useEffect, useState } from "react";

const emptyData = {
  name: "",
  capacity: "",
  location: "",
  availabilityWindow: "",
  type: "",
  status: "",
};

const typeOptions = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const statusOptions = ["ACTIVE", "OUT_OF_SERVICE"];

function ResourceForm({
  initialData,
  onSubmit,
  loading,
  submitLabel,
  enableDraft = true,
  draftKey = "m1-resource-draft",
}) {
  const [formData, setFormData] = useState({ ...emptyData, ...initialData });
  const [errors, setErrors] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let nextData = { ...emptyData, ...initialData };
    if (enableDraft && !initialData?.id) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try { nextData = { ...nextData, ...JSON.parse(saved) }; }
        catch { localStorage.removeItem(draftKey); }
      }
    }
    setFormData(nextData);
    setErrors([]);
  }, [draftKey, enableDraft, initialData]);

  useEffect(() => {
    if (!enableDraft || initialData?.id) return;
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [draftKey, enableDraft, formData, initialData]);

  useEffect(() => {
    if (errors.length === 0) { setShowPopup(false); return; }
    setShowPopup(true);
    const id = setTimeout(() => setShowPopup(false), 3500);
    return () => clearTimeout(id);
  }, [errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    const nextErrors = [];
    const nameVal = formData.name.trim();
    const locVal = formData.location.trim();
    const availVal = formData.availabilityWindow.trim();
    const capVal = Number(formData.capacity);

    if (!nameVal) nextErrors.push("Name is required.");
    if (nameVal.length > 60) nextErrors.push("Name must be 60 characters or less.");
    if (!String(formData.capacity).trim()) nextErrors.push("Capacity is required.");
    if (!Number.isInteger(capVal) || capVal <= 0) nextErrors.push("Capacity must be a positive whole number.");
    if (!locVal) nextErrors.push("Location is required.");
    if (locVal.length > 80) nextErrors.push("Location must be 80 characters or less.");
    if (!availVal) nextErrors.push("Availability window is required.");
    if (!formData.type) nextErrors.push("Type is required.");
    if (!formData.status) nextErrors.push("Status is required.");

    if (nextErrors.length > 0) { setErrors(nextErrors); return; }

    onSubmit({ name: nameVal, capacity: capVal, location: locVal, availabilityWindow: availVal, type: formData.type, status: formData.status });
  };

  return (
    <form onSubmit={handleSubmit} className="m1-form">
      {showPopup && (
        <div className="m1-toast">
          <p style={{ fontWeight: 600 }}>Validation issues</p>
          <p>Please review the form fields.</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="m1-form-errors">
          <p>Please fix the following:</p>
          <ul>
            {errors.map((err) => <li key={err}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="m1-form-grid">
        <div className="m1-form-field">
          <label className="m1-form-label">Name *</label>
          <input name="name" value={formData.name} onChange={handleChange} maxLength={60} className="m1-input" placeholder="Resource name" />
          <span className="m1-form-hint">Maximum 60 characters.</span>
        </div>

        <div className="m1-form-field">
          <label className="m1-form-label">Capacity *</label>
          <input name="capacity" type="number" min="1" step="1" value={formData.capacity} onChange={handleChange} className="m1-input" placeholder="e.g. 120" />
          <span className="m1-form-hint">Use a positive whole number.</span>
        </div>

        <div className="m1-form-field">
          <label className="m1-form-label">Location *</label>
          <input name="location" value={formData.location} onChange={handleChange} maxLength={80} className="m1-input" placeholder="Building / Room" />
          <span className="m1-form-hint">Maximum 80 characters.</span>
        </div>

        <div className="m1-form-field">
          <label className="m1-form-label">Availability Window *</label>
          <input name="availabilityWindow" value={formData.availabilityWindow} onChange={handleChange} className="m1-input" placeholder="08:00-18:00" />
        </div>

        <div className="m1-form-field">
          <label className="m1-form-label">Type *</label>
          <select name="type" value={formData.type} onChange={handleChange} className="m1-input">
            <option value="">Select type</option>
            {typeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="m1-form-field">
          <label className="m1-form-label">Status *</label>
          <select name="status" value={formData.status} onChange={handleChange} className="m1-input">
            <option value="">Select status</option>
            {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="m1-btn-group">
        <button type="submit" disabled={loading} className="m1-btn-primary">
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ResourceForm;
