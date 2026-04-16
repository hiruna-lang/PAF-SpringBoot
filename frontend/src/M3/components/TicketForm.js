import { useState } from "react";
import { CATEGORIES, PRIORITY_LEVELS, RESOURCE_LOCATIONS } from "../constants";
import { VALIDATION_LIMITS, validateTicketForm } from "../validation";
import AttachmentUploader from "./AttachmentUploader";

export default function TicketForm({ onSubmit, isSubmitting, defaultContact }) {
  const [formData, setFormData] = useState({
    resource: RESOURCE_LOCATIONS[0],
    category: CATEGORIES[0],
    priority: "MEDIUM",
    description: "",
    preferredContact: defaultContact || "",
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    clearError(name);
  }

  function validate() {
    const nextErrors = validateTicketForm(formData, files);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleFilesChange(nextFiles) {
    setFiles(nextFiles);
    clearError("attachments");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        resource: formData.resource.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        preferredContact: formData.preferredContact.trim(),
        attachments: files,
      });
      setFormData({
        resource: RESOURCE_LOCATIONS[0],
        category: CATEGORIES[0],
        priority: "MEDIUM",
        description: "",
        preferredContact: defaultContact || "",
      });
      setFiles([]);
      setErrors({});
    } catch (error) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length) {
        setErrors(error.fieldErrors);
      }
    }
  }

  return (
    <form className="m3-form-card" onSubmit={handleSubmit}>
      <div className="m3-form-card__header">
        <div>
          <span className="m3-eyebrow">Incident Submission</span>
          <h2>Create Maintenance Ticket</h2>
        </div>
        <p>Capture the issue clearly so triage, assignment, and execution can happen without guesswork.</p>
      </div>

      <div className="m3-guidance-strip m3-guidance-strip--compact">
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Describe Impact</span>
          <p>Tell the team what is broken, who is affected, and whether safety or downtime is involved.</p>
        </article>
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Set Priority</span>
          <p>Use urgency honestly so the queue reflects real operational pressure.</p>
        </article>
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Attach Evidence</span>
          <p>Images speed up diagnosis and reduce back-and-forth before dispatch.</p>
        </article>
      </div>

      <div className="m3-form-grid">
        <div className="m3-form-field">
          <label htmlFor="resource">Resource / Location</label>
          <select id="resource" name="resource" value={formData.resource} onChange={updateField}>
            {RESOURCE_LOCATIONS.map((resource) => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>
          {errors.resource ? <span className="m3-field-error">{errors.resource}</span> : null}
        </div>

        <div className="m3-form-field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={formData.category} onChange={updateField}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category ? <span className="m3-field-error">{errors.category}</span> : null}
        </div>

        <div className="m3-form-field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={formData.priority} onChange={updateField}>
            {PRIORITY_LEVELS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="m3-form-field">
          <label htmlFor="preferredContact">Preferred Contact</label>
          <input
            id="preferredContact"
            name="preferredContact"
            type="text"
            value={formData.preferredContact}
            onChange={updateField}
            placeholder="Phone or email"
            maxLength={VALIDATION_LIMITS.ticket.maxContactLength}
          />
          {errors.preferredContact ? <span className="m3-field-error">{errors.preferredContact}</span> : null}
        </div>

        <div className="m3-form-field m3-form-field--full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="6"
            value={formData.description}
            onChange={updateField}
            placeholder="Describe the issue, impact, and any safety concerns."
            maxLength={VALIDATION_LIMITS.ticket.maxDescriptionLength}
          />
          {errors.description ? <span className="m3-field-error">{errors.description}</span> : null}
        </div>

        <div className="m3-form-field m3-form-field--full">
          <AttachmentUploader files={files} setFiles={handleFilesChange} error={errors.attachments} />
        </div>
      </div>

      <div className="m3-form-actions">
        <p className="m3-form-actions__note">Well-structured tickets move faster through the operational pipeline.</p>
        <button type="submit" className="m3-primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
}
