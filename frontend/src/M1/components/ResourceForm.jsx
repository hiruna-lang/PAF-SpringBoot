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
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          nextData = { ...nextData, ...JSON.parse(savedDraft) };
        } catch (error) {
          localStorage.removeItem(draftKey);
        }
      }
    }
    setFormData(nextData);
    setErrors([]);
  }, [draftKey, enableDraft, initialData]);

  useEffect(() => {
    if (!enableDraft || initialData?.id) {
      return;
    }
    localStorage.setItem(draftKey, JSON.stringify(formData));
  }, [draftKey, enableDraft, formData, initialData]);

  useEffect(() => {
    if (errors.length === 0) {
      setShowPopup(false);
      return;
    }
    setShowPopup(true);
    const timeoutId = setTimeout(() => {
      setShowPopup(false);
    }, 3500);
    return () => clearTimeout(timeoutId);
  }, [errors]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors([]);

    const nextErrors = [];
    const nameValue = formData.name.trim();
    const locationValue = formData.location.trim();
    const availabilityValue = formData.availabilityWindow.trim();
    const capacityValue = Number(formData.capacity);

    if (!nameValue) {
      nextErrors.push("Name is required.");
    }
    if (nameValue.length > 60) {
      nextErrors.push("Name must be 60 characters or less.");
    }
    if (!String(formData.capacity).trim()) {
      nextErrors.push("Capacity is required.");
    }
    if (!Number.isInteger(capacityValue) || capacityValue <= 0) {
      nextErrors.push("Capacity must be a positive whole number.");
    }
    if (!locationValue) {
      nextErrors.push("Location is required.");
    }
    if (locationValue.length > 80) {
      nextErrors.push("Location must be 80 characters or less.");
    }
    if (!availabilityValue) {
      nextErrors.push("Availability window is required.");
    }
    if (!formData.type) {
      nextErrors.push("Type is required.");
    }
    if (!formData.status) {
      nextErrors.push("Status is required.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: nameValue,
      capacity: capacityValue,
      location: locationValue,
      availabilityWindow: availabilityValue,
      type: formData.type,
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {showPopup && (
        <div className="fixed right-6 top-6 z-50 w-80 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg">
          <p className="font-semibold">Validation issues</p>
          <p className="text-xs text-slate-500">Please review the form fields.</p>
        </div>
      )}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Please fix the following:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            maxLength={60}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Resource name"
          />
          <p className="text-xs text-slate-400">Maximum 60 characters.</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Capacity *</label>
          <input
            name="capacity"
            type="number"
            min="1"
            step="1"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="e.g. 120"
          />
          <p className="text-xs text-slate-400">Use a positive whole number.</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Location *</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            maxLength={80}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Building / Room"
          />
          <p className="text-xs text-slate-400">Maximum 80 characters.</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">
            Availability Window *
          </label>
          <input
            name="availabilityWindow"
            value={formData.availabilityWindow}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="08:00-18:00"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select type</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Status *</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default ResourceForm;
