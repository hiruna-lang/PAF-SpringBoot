import { useState } from "react";
import { useTickets } from "../context/TicketContext";
import { countByStatus, pluralize } from "../utils";
import { VALIDATION_LIMITS, validateTechnicianForm } from "../validation";

export default function AdminPanelPage() {
  const { technicians, tickets, createTechnician, isBootstrapping } = useTickets();
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const openCount = countByStatus(tickets, "OPEN");
  const inProgressCount = countByStatus(tickets, "IN_PROGRESS");
  const criticalCount = tickets.filter((ticket) => ticket.priority === "CRITICAL").length;

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validateTechnicianForm(formData);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await createTechnician({
        ...formData,
        name: formData.name.trim(),
        specialization: formData.specialization.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });
      setFormData({ name: "", specialization: "", phone: "", email: "", password: "" });
      setErrors({});
    } catch (error) {
      if (error?.fieldErrors && Object.keys(error.fieldErrors).length) {
        setErrors(error.fieldErrors);
      }
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function handleClear() {
    setFormData({ name: "", specialization: "", phone: "", email: "", password: "" });
    setErrors({});
  }

  return (
    <div className="m3-page-stack">
      <section className="m3-guidance-strip">
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Coverage</span>
          <strong>{pluralize(technicians.length, "technician")} active in the network</strong>
          <p>Use onboarding to expand capacity before queue pressure becomes visible to requesters.</p>
        </article>
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Open Demand</span>
          <strong>{pluralize(openCount + inProgressCount, "ticket")} need operational movement</strong>
          <p>The control deck works best when dispatch and status transitions happen with low friction.</p>
        </article>
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Escalation</span>
          <strong>{pluralize(criticalCount, "critical issue")} on watch</strong>
          <p>Critical work should remain obvious in both the dashboard and the admin queue.</p>
        </article>
      </section>

      <section className="m3-surface-card">
        <div className="m3-section-header">
          <div>
            <span className="m3-eyebrow">Operational Governance</span>
            <h2>Admin Panel</h2>
            <p>Review technician capacity, queue ownership, and role-scoped operational health.</p>
          </div>
        </div>
        <div className="m3-metric-grid">
          {technicians.map((technician) => (
            <article key={technician.id} className="m3-metric-card">
              <span>{technician.specialization}</span>
              <strong>{technician.name}</strong>
              <p>{technician.activeJobs} active field jobs currently assigned.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="m3-surface-card m3-form-card">
        <div className="m3-form-card__header">
          <div>
            <span className="m3-eyebrow">Onboarding</span>
            <h2>Provision New Technician</h2>
            <p>Deploy a new field operative to the operational grid.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="m3-form-grid">
          <div className="m3-form-field">
            <label htmlFor="name">Operative Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. Jane Doe"
              className="m3-input"
              value={formData.name}
              onChange={handleChange}
              maxLength={VALIDATION_LIMITS.technician.maxNameLength}
              required
            />
            {errors.name ? <span className="m3-field-error">{errors.name}</span> : null}
          </div>
          
          <div className="m3-form-field">
            <label htmlFor="specialization">Division Specialization</label>
            <select
              id="specialization"
              name="specialization"
              className="m3-input"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Division</option>
              <option value="IT Operations">IT Operations</option>
              <option value="Network Infrastructure">Network Infrastructure</option>
              <option value="Hardware Services">Hardware Services</option>
              <option value="Security Access">Security Access</option>
              <option value="Facilities">Facilities</option>
            </select>
            {errors.specialization ? <span className="m3-field-error">{errors.specialization}</span> : null}
          </div>
          
          <div className="m3-form-field">
            <label htmlFor="email">Comms (Email)</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="operative@corp.local"
              className="m3-input"
              value={formData.email}
              onChange={handleChange}
              maxLength={VALIDATION_LIMITS.technician.maxEmailLength}
              required
            />
            {errors.email ? <span className="m3-field-error">{errors.email}</span> : null}
          </div>
          
          <div className="m3-form-field">
            <label htmlFor="phone">Direct Line</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              className="m3-input"
              value={formData.phone}
              onChange={handleChange}
              maxLength={VALIDATION_LIMITS.technician.maxPhoneLength}
            />
            {errors.phone ? <span className="m3-field-error">{errors.phone}</span> : null}
          </div>
          
          <div className="m3-form-field m3-form-field--full">
            <label htmlFor="password">Access Credential (Password)</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter secure initial password..."
              className="m3-input"
              value={formData.password}
              onChange={handleChange}
              maxLength={VALIDATION_LIMITS.technician.maxPasswordLength}
              required
            />
            {errors.password ? <span className="m3-field-error">{errors.password}</span> : null}
          </div>
          
          <div className="m3-form-actions m3-form-field--full">
            <button
              type="button"
              className="m3-secondary-button"
              onClick={handleClear}
            >
              Clear
            </button>
            <button type="submit" className="m3-primary-button" disabled={isBootstrapping}>
              Initialize Technician
            </button>
          </div>
        </form>
      </section>

      <section className="m3-surface-card">
        <div className="m3-section-header">
          <div>
            <span className="m3-eyebrow">Queue Governance</span>
            <h2>Escalation Watchlist</h2>
          </div>
        </div>
        <div className="m3-dashboard-list">
          {tickets
            .filter((ticket) => ticket.priority === "CRITICAL" || ticket.status === "OPEN")
            .slice(0, 6)
            .map((ticket) => (
              <article key={ticket.id} className="m3-dashboard-list__item">
                <div>
                  <strong>{ticket.id}</strong>
                  <span>{ticket.resource}</span>
                </div>
                <div className="m3-dashboard-list__meta">
                  <span>{ticket.priority}</span>
                  <span>{ticket.status}</span>
                </div>
              </article>
            ))}
        </div>
      </section>
    </div>
  );
}
