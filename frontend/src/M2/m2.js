import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isLoggedIn, getUser, isAdmin, logout } from "../M4/authService";
import ResourceList from "./ResourceList";
import BookingForm from "./BookingForm";
import MyBookings from "./MyBookings";
import AdminM2 from "./AdminM2";
import Toast, { makeToast } from "./Toast";
import "./M2.css";

const NAV_ITEMS = [
  { key: "resources",   label: "Resources",   icon: "🏢" },
  { key: "my-bookings", label: "My Bookings", icon: "📅" },
];

function M2UserView() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();

  if (!loggedIn) {
    return (
      <div className="m2-wrap">
        <div className="m2-header">
          <div className="m2-header-brand">
            <div className="m2-header-icon">🏛</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Booking Management</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "3rem 2rem", maxWidth: 500 }}>
          <div className="alert alert-info">
            <span className="alert-icon">ℹ</span>
            <div>
              <strong>Login required</strong>
              <div style={{ marginTop: ".25rem", fontSize: ".875rem" }}>You must be logged in to access Booking Management.</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/m4/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <M2LoggedInView navigate={navigate} />;
}

function M2LoggedInView({ navigate }) {
  const user = getUser();
  const admin = isAdmin();

  const [tab, setTab] = useState("resources");
  const [bookingResource, setBookingResource] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message) => {
    setToasts(t => [...t, makeToast(type, message)]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const handleBookSuccess = (booking) => {
    setBookingResource(null);
    addToast("success", `Booking for "${booking.resourceName}" submitted — awaiting admin approval.`);
    setTab("my-bookings");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [...NAV_ITEMS];
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase();
  const rolePill = user?.role === "ADMIN" ? "#1e40af" : "#166534";

  return (
    <div className="m2-wrap">
      {/* Header */}
      <div className="m2-header">
        <div className="m2-header-brand">
          <div className="m2-header-icon">🏛</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Booking Management</div>
            <div className="m2-header-subtitle">Smart Campus Operations Hub</div>
          </div>
        </div>
        <div className="m2-header-right">
          <div className="m2-user-chip">
            <div className="m2-user-avatar">{initials}</div>
            <span>{user?.name || user?.email}</span>
            <span style={{ background: rolePill, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: ".7rem", fontWeight: 700 }}>
              {user?.role}
            </span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/")}>Home</button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="m2-layout">
        {/* Sidebar */}
        <div className="m2-sidebar">
          <div style={{ padding: "0 1.25rem 1rem", fontSize: ".7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".6px" }}>
            Navigation
          </div>
          {navItems.map(item => (
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
          {admin && (
            <button className="m2-nav-item" onClick={() => navigate("/m2/admin")} style={{ color: "#1e40af", fontWeight: 600 }}>
              <span className="m2-nav-icon">🛡</span>
              Admin Panel
            </button>
          )}
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
          {tab === "resources" && (
            <ResourceList onBook={r => setBookingResource(r)} onToast={addToast} adminMode={false} />
          )}
          {tab === "my-bookings" && (
            <MyBookings onToast={addToast} />
          )}
        </div>
      </div>

      {/* Booking form modal */}
      {bookingResource && (
        <BookingForm
          resource={bookingResource}
          onSuccess={handleBookSuccess}
          onCancel={() => setBookingResource(null)}
        />
      )}

      {/* Toast notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function M2() {
  const location = useLocation();
  const isAdminPanelRoute = location.pathname.startsWith("/m2/admin");

  if (isAdminPanelRoute) {
    return <AdminM2 />;
  }

  return <M2UserView />;
}

export default M2;
