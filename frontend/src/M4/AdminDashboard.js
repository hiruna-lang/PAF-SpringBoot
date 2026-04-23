import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout, authFetch } from "./authService";
import "./M4.css";

const ROLES    = ["USER", "TECHNICIAN", "ADMIN"];
const BACKEND  = "http://localhost:8081";

const ROLE_ICONS = {
  ADMIN:      "👑",
  TECHNICIAN: "🔧",
  USER:       "👤",
};

export default function AdminDashboard() {
  const navigate    = useNavigate();
  const currentUser = getUser();

  const [users,   setUsers]   = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState("");
  const [saving,  setSaving]  = useState(null);   // userId currently being saved
  const [toast,   setToast]   = useState(null);   // { msg, type: "success"|"error" }

  // ── Load users + stats ──────────────────────────────────
  const loadData = () => {
    setLoading(true);
    setPageErr("");
    Promise.all([
      authFetch(`${BACKEND}/api/admin/users`),
      authFetch(`${BACKEND}/api/admin/dashboard`),
    ])
      .then(async ([usersRes, statsRes]) => {
        if (!usersRes.ok) throw new Error("Access denied — ADMIN role required");
        setUsers(await usersRes.json());
        setStats(await statsRes.json());
      })
      .catch(err => setPageErr(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Make sure the backend is running on port 8081."
          : err.message
      ))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // ── Show toast ──────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Role change ─────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    try {
      const res = await authFetch(`${BACKEND}/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }

      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      showToast(`✅ Role updated to ${newRole}`);
    } catch (err) {
      const msg = err.message === "Failed to fetch"
        ? "Cannot reach server. Check backend is running."
        : err.message;
      showToast(`❌ ${msg}`, "error");
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/m4/login"); };

  // ── Derived stats ────────────────────────────────────────
  const countByRole = (role) => users.filter(u => u.role === role).length;

  return (
    <div className="admin-wrapper">

      {/* ── Toast notification ─────────────────────────── */}
      {toast && (
        <div className={`admin-toast ${toast.type === "error" ? "admin-toast-error" : "admin-toast-success"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────── */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="auth-brand-icon" style={{ display: "inline-flex" }}>🎓</div>
          <span className="admin-title">Admin Panel</span>
        </div>
        <div className="admin-header-right">
          <span className="admin-user-name">{currentUser?.name || currentUser?.email}</span>
          <span className="badge badge-admin">ADMIN</span>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className="admin-main">

        {/* ── Stats ──────────────────────────────────────── */}
        <div className="admin-stats">
          {[
            { label: "Total Users",  value: users.length },
            { label: "Admins",       value: countByRole("ADMIN") },
            { label: "Technicians",  value: countByRole("TECHNICIAN") },
            { label: "Users",        value: countByRole("USER") },
          ].map((s, i) => (
            <div key={i} className="admin-stat-card">
              <div className="admin-stat-value">{loading ? "—" : s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Users table ────────────────────────────────── */}
        <div className="admin-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <h3 className="admin-card-title">User Management</h3>
            <button className="admin-nav-btn" onClick={loadData} style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
              🔄 Refresh
            </button>
          </div>

          {/* Page-level error */}
          {pageErr && (
            <div className="alert alert-error" style={{ marginBottom: "16px" }}>
              {pageErr}
              <button
                onClick={loadData}
                style={{ marginLeft: "12px", background: "none", border: "none",
                  color: "#b91c1c", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 0", color: "#6b7280" }}>
              <div className="admin-spinner" />
              Loading users…
            </div>
          )}

          {!loading && !pageErr && users.length === 0 && (
            <p style={{ color: "#9ca3af", padding: "20px 0" }}>No users found.</p>
          )}

          {!loading && !pageErr && users.length > 0 && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Provider</th>
                    <th>Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={u.email === currentUser?.email ? "current-user-row" : ""}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="user-id-badge" data-prefix={u.id?.split("-")[0]}>
                          {u.id || "—"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.name || "—"}</td>
                      <td style={{ color: "#6b7280", fontSize: "0.85rem" }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.provider === "GOOGLE" ? "badge-google" : "badge-local"}`}>
                          {u.provider}
                        </span>
                      </td>
                      <td>
                        <span className={`badge role-badge-${u.role?.toLowerCase()}`}>
                          {ROLE_ICONS[u.role] || "👤"} {u.role}
                        </span>
                      </td>
                      <td>
                        {u.email === currentUser?.email ? (
                          <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>You</span>
                        ) : saving === u.id ? (
                          <span style={{ color: "#6b7280", fontSize: "0.82rem" }}>Saving…</span>
                        ) : (
                          <select
                            className="role-select"
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>
                                {ROLE_ICONS[r]} {r}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Nav ────────────────────────────────────────── */}
        <div className="admin-nav-row">
          <button className="admin-nav-btn" onClick={() => navigate("/m4/dashboard")}>
            👤 My Profile
          </button>
          <button className="admin-nav-btn" onClick={() => navigate("/home")}>
            🌐 Explore
          </button>
        </div>

      </main>
    </div>
  );
}
