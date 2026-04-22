import React, { useEffect, useState, useCallback } from "react";
import {
  fetchResources, createResource, updateResource,
  setResourceStatus, deleteResource
} from "./bookingService";
import { isAdmin } from "../M4/authService";

const TYPES = ["ROOM", "LAB", "EQUIPMENT", "SPORTS_FACILITY", "AUDITORIUM"];
const STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];

const TYPE_ICONS = {
  ROOM: "🏫", LAB: "🔬", EQUIPMENT: "📹", SPORTS_FACILITY: "⚽", AUDITORIUM: "🎭"
};

const STATUS_NEXT = {
  ACTIVE: ["OUT_OF_SERVICE", "MAINTENANCE"],
  OUT_OF_SERVICE: ["ACTIVE"],
  MAINTENANCE: ["ACTIVE"]
};

function resourceStatusBadge(status) {
  const cls = { ACTIVE: "badge-active", OUT_OF_SERVICE: "badge-out-of-service", MAINTENANCE: "badge-maintenance" };
  const label = status?.replace("_", " ") || "";
  return <span className={`badge ${cls[status] || ""}`}>{label}</span>;
}

function ResourceList({ onBook, onToast, adminMode }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [minCapacity, setMinCapacity] = useState("");

  // Form modal
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", type: "ROOM", location: "", capacity: "", description: "", availabilityNote: "", status: "ACTIVE" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const admin = adminMode !== undefined ? adminMode : isAdmin();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (keyword.trim())   params.keyword = keyword.trim();
      if (filterType)       params.type = filterType;
      if (filterStatus)     params.status = filterStatus;
      if (minCapacity)      params.minCapacity = parseInt(minCapacity);
      const data = await fetchResources(params);
      setResources(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [keyword, filterType, filterStatus, minCapacity]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", type: "ROOM", location: "", capacity: "", description: "", availabilityNote: "", status: "ACTIVE" });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({
      name: r.name,
      type: r.type,
      location: r.location || "",
      capacity: r.capacity != null ? String(r.capacity) : "",
      description: r.description || "",
      availabilityNote: r.availabilityNote || "",
      status: r.status || "ACTIVE"
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Resource name is required"); return; }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : null
      };
      if (editTarget) {
        await updateResource(editTarget.id, payload);
        onToast("success", `"${form.name}" updated.`);
      } else {
        await createResource(payload);
        onToast("success", `"${form.name}" created.`);
      }
      setShowForm(false);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (r, newStatus) => {
    try {
      await setResourceStatus(r.id, newStatus);
      onToast("success", `"${r.name}" set to ${newStatus.replace("_", " ")}.`);
      load();
    } catch (e) {
      onToast("error", e.message);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    try {
      await deleteResource(r.id);
      onToast("info", `"${r.name}" deleted.`);
      load();
    } catch (e) {
      onToast("error", e.message);
    }
  };

  const activeCount = resources.filter(r => r.status === "ACTIVE").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Campus Resources</div>
          <div className="page-subtitle">
            {loading ? "Loading..." : `${resources.length} result${resources.length !== 1 ? "s" : ""} · ${activeCount} active`}
          </div>
        </div>
        {admin && (
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <span className="filter-label">Search</span>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Name or location..."
            style={{ minWidth: 180 }}
          />
        </div>
        <div className="filter-group">
          <span className="filter-label">Type</span>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t.replace("_", " ")}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Status</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Min Capacity</span>
          <input
            type="number" min="1"
            value={minCapacity}
            onChange={e => setMinCapacity(e.target.value)}
            placeholder="e.g. 30"
            style={{ width: 90 }}
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load} style={{ alignSelf: "flex-end" }}>
          ↺ Refresh
        </button>
        {(keyword || filterType || filterStatus || minCapacity) && (
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end" }} onClick={() => {
            setKeyword(""); setFilterType(""); setFilterStatus(""); setMinCapacity("");
          }}>
            ✕ Clear
          </button>
        )}
      </div>

      {error && <div className="alert alert-error"><span className="alert-icon">⚠</span>{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /><span style={{ color: "#64748b" }}>Loading resources...</span></div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <div className="empty-title">No resources found</div>
          <div className="empty-sub">Try adjusting your filters</div>
        </div>
      ) : (
        <div className="resource-grid">
          {resources.map(r => (
            <div
              key={r.id}
              className={`resource-card ${r.status === "OUT_OF_SERVICE" ? "out-of-service" : r.status === "MAINTENANCE" ? "maintenance" : ""}`}
            >
              <div className="resource-card-header">
                <div>
                  <span className="resource-type-pill">{TYPE_ICONS[r.type]} {r.type.replace("_", " ")}</span>
                  <div className="resource-card-title" style={{ marginTop: 4 }}>{r.name}</div>
                </div>
                {resourceStatusBadge(r.status)}
              </div>

              <div className="resource-card-body">
                {r.location && (
                  <div className="resource-meta-row">
                    <span className="resource-meta-icon">📍</span>
                    <span>{r.location}</span>
                  </div>
                )}
                {r.capacity && (
                  <div className="resource-meta-row">
                    <span className="resource-meta-icon">👥</span>
                    <span>Capacity: <strong>{r.capacity}</strong></span>
                  </div>
                )}
                {r.description && <div className="resource-desc">{r.description}</div>}
                {r.availabilityNote && (
                  <div className="resource-avail-note">
                    🕐 {r.availabilityNote}
                  </div>
                )}
              </div>

              <div className="resource-card-footer">
                {!admin && (r.status === "ACTIVE" ? (
                  <button className="btn btn-primary btn-sm" onClick={() => onBook(r)}>
                    Book Now
                  </button>
                ) : (
                  <span style={{ fontSize: ".8rem", color: "#94a3b8" }}>Not bookable</span>
                ))}

                {admin && (
                  <div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap" }}>
                    <button className="btn btn-secondary btn-xs" onClick={() => openEdit(r)}>Edit</button>
                    {STATUS_NEXT[r.status]?.map(ns => (
                      <button
                        key={ns}
                        className={`btn btn-xs ${ns === "ACTIVE" ? "btn-success" : ns === "OUT_OF_SERVICE" ? "btn-danger" : "btn-warning"}`}
                        onClick={() => handleStatusChange(r, ns)}
                      >
                        {ns === "ACTIVE" ? "Activate" : ns === "OUT_OF_SERVICE" ? "Disable" : "Maintenance"}
                      </button>
                    ))}
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(r)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editTarget ? "Edit Resource" : "Add Resource"}</div>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            {formError && <div className="alert alert-error"><span className="alert-icon">⚠</span>{formError}</div>}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name <span className="required">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Lecture Hall A" />
              </div>
              <div className="form-group">
                <label className="form-label">Type <span className="required">*</span></label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Block A, Floor 1" />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="e.g. 30" />
              </div>
              <div className="form-group form-span">
                <label className="form-label">Availability Note</label>
                <input value={form.availabilityNote} onChange={e => setForm(f => ({ ...f, availabilityNote: e.target.value }))} placeholder="e.g. Mon–Fri 08:00–20:00" />
                <span className="form-hint">Displayed to users when browsing resources</span>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div className="form-group form-span">
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the resource" />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editTarget ? "Save Changes" : "Create Resource"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResourceList;
