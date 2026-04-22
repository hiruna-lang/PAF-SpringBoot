import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getUser, logout } from "../M4/authService";
import AdminBookings from "./AdminBookings";
import Toast, { makeToast } from "./Toast";
import "./M2.css";

const NAV_ITEMS = [
  { key: "bookings",   label: "Manage Bookings",   icon: "📋" },
];

function AdminM2() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const [tab, setTab] = useState("bookings");
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    setToasts(t => [...t, makeToast(type, message)]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!loggedIn) {
    return (
      <div className="m2-wrap">
        <div className="m2-header">
          <div className="m2-header-brand">
            <div className="m2-header-icon">🛡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Admin Panel</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "3rem 2rem", maxWidth: 500 }}>
          <div className="alert alert-info">
            <span className="alert-icon">ℹ</span>
            <div>
              <strong>Login required</strong>
              <div style={{ marginTop: ".25rem", fontSize: ".875rem" }}>You must be logged in to access the Admin Panel.</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/m4/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const initials = (user?.name || user?.email || "A").charAt(0).toUpperCase();

  return (
    <div className="m2-wrap">
      {/* Header */}
      <div className="m2-header">
        <div className="m2-header-brand">
          <div className="m2-header-icon">🛡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Admin Panel</div>
            <div className="m2-header-subtitle">Booking Management</div>
          </div>
        </div>
        <div className="m2-header-right">
          <div className="m2-user-chip">
            <div className="m2-user-avatar">{initials}</div>
            <span>{user?.name || user?.email}</span>
            <span style={{ background: user?.role === "ADMIN" ? "#1e40af" : "#166534", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: ".7rem", fontWeight: 700 }}>
              {user?.role}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/m2")}>User View</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/")}>Home</button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="m2-layout">
        {/* Sidebar */}
        <div className="m2-sidebar">
          <div style={{ padding: "0 1.25rem 1rem", fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".6px" }}>
            Admin
          </div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`m2-nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              <span className="m2-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          <div className="m2-nav-divider" />
          <button className="m2-nav-item" onClick={() => navigate("/m2")}>
            <span className="m2-nav-icon">👤</span>
            User View
          </button>
          <button className="m2-nav-item" onClick={() => navigate("/")}>
            <span className="m2-nav-icon">🏠</span>
            Home
          </button>
          <button className="m2-nav-item" onClick={handleLogout} style={{ color: "#b91c1c" }}>
            <span className="m2-nav-icon">↩</span>
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="m2-main">
          {tab === "bookings" && (
            <AdminBookings onToast={addToast} />
          )}
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default AdminM2;
