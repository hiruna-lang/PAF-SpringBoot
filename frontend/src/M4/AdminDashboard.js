import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout, authFetch } from "./authService";
import "./M4.css";

const ROLES = ["USER", "MANAGER", "ADMIN"];
const BACKEND = "http://localhost:8081";

function AdminDashboard() {
  const navigate  = useNavigate();
  const currentUser = getUser();

  const [users, setUsers]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [saving, setSaving]   = useState(null); // userId being saved

  // Load users + stats
  useEffect(() => {
    Promise.all([
      authFetch(`${BACKEND}/api/admin/users`),
      authFetch(`${BACKEND}/api/admin/dashboard`),
    ])
      .then(async ([usersRes, statsRes]) => {
        if (!usersRes.ok) throw new Error("Access denied");
        setUsers(await usersRes.json());
        setStats(await statsRes.json());
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    try {
      const res = await authFetch(`${BACKEND}/api/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/m4/login"); };

  return (
    <div className="admin-wrapper">
      {/* Header */}
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
        {/* Stats cards */}
        {stats && (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-value">{stats.totalUsers}</div>
              <div className="admin-stat-label">Total Users</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value">
                {users.filter(u => u.role === "ADMIN").length}
              </div>
              <div className="admin-stat-label">Admins</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value">
                {users.filter(u => u.role === "MANAGER").length}
              </div>
              <div className="admin-stat-label">Managers</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-value">
                {users.filter(u => u.role === "USER").length}
              </div>
              <div className="admin-stat-label">Users</div>
            </div>
          </div>
        )}

        {/* Users table */}
        <div className="admin-card">
          <h3 className="admin-card-title">User Management</h3>

          {error   && <div className="alert alert-error">{error}</div>}
          {loading && <p style={{ color: "#6b7280", padding: "20px 0" }}>Loading users…</p>}

          {!loading && !error && (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
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
                      <td>{u.name || "—"}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.provider === "GOOGLE" ? "badge-google" : "badge-local"}`}>
                          {u.provider}
                        </span>
                      </td>
                      <td>
                        <span className={`badge role-badge-${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.email === currentUser?.email ? (
                          <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>You</span>
                        ) : (
                          <select
                            className="role-select"
                            value={u.role}
                            disabled={saving === u.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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

        {/* Quick nav */}
        <div className="admin-nav-row">
          <button className="admin-nav-btn" onClick={() => navigate("/m4/dashboard")}>
            👤 My Profile
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
