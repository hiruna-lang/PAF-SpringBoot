import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../M4/useNotifications";
import { isLoggedIn, getUser } from "../M4/authService";
import "./NotificationsPage.css";

// ── Type & source metadata ─────────────────────────────────────────────────
const TYPE_META = {
  login:       { icon: "🔑", label: "Sign-in",      color: "#6366f1" },
  register:    { icon: "🎉", label: "Registration",  color: "#16a34a" },
  role_change: { icon: "👑", label: "Role Change",   color: "#d97706" },
  security:    { icon: "🛡️", label: "Security",      color: "#0ea5e9" },
  system:      { icon: "⚙️", label: "System",        color: "#6b7280" },
  booking:     { icon: "📅", label: "Booking",       color: "#8b5cf6" },
  resource:    { icon: "🏛️", label: "Resource",      color: "#10b981" },
  ticket:      { icon: "🎫", label: "Ticket",        color: "#f59e0b" },
};

const SOURCE_META = {
  M4: { label: "Auth",      color: "#6366f1", bg: "#eef2ff" },
  M2: { label: "Booking",   color: "#8b5cf6", bg: "#f5f3ff" },
  M1: { label: "Resources", color: "#10b981", bg: "#f0fdf4" },
  M3: { label: "Tickets",   color: "#f59e0b", bg: "#fffbeb" },
};

const FILTERS = [
  { key: "All",  label: "All" },
  { key: "M4",   label: "Auth" },
  { key: "M2",   label: "Booking" },
  { key: "M1",   label: "Resources" },
  { key: "M3",   label: "Tickets" },
];

function typeMeta(type) {
  return TYPE_META[type] || { icon: "🔔", label: "Info", color: "#6366f1" };
}
function sourceMeta(source) {
  return SOURCE_META[source] || { label: source || "System", color: "#6b7280", bg: "#f9fafb" };
}
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isLoggedIn();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState("All");

  const visible = filter === "All"
    ? notifications
    : notifications.filter((n) => n.source === filter);

  const visibleUnread = visible.filter((n) => !n.read).length;

  return (
    <div className="hn-root">
      {/* ── Navbar ── */}
      <nav className="hn-nav">
        <button className="hn-nav-brand" type="button" onClick={() => navigate("/")}>
          <span className="hn-brand-icon">SC</span>
          <span className="hn-brand-name">SmartCampus</span>
        </button>
        <div className="hn-nav-right">
          {loggedIn && user && (
            <div className="hn-user-chip">
              <div className="hn-user-avatar">
                {user.photoUrl
                  ? <img src={user.photoUrl} alt="avatar" />
                  : (user.name || user.email || "U").charAt(0).toUpperCase()}
              </div>
              <span>{user.name || user.email}</span>
              <span className="hn-role-pill">{user.role}</span>
            </div>
          )}
          <button className="hn-back-btn" type="button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </nav>

      <main className="hn-main">
        {/* ── Hero banner ── */}
        <div className="hn-hero">
          <div className="hn-hero-left">
            <div className="hn-hero-badge">
              <span className="hn-hero-dot" />
              ALL MODULES · ACTIVITY FEED
            </div>
            <h1>Notifications</h1>
            <p>Your unified activity log — auth, bookings, resources, and tickets all in one place.</p>
            {unreadCount > 0 && (
              <button
                className="hn-mark-all-btn"
                type="button"
                onClick={markAllRead}
                disabled={loading}
              >
                {loading ? "Marking…" : "✓ Mark all as read"}
              </button>
            )}
          </div>
          <div className="hn-hero-stats">
            <div className="hn-stat">
              <span className="hn-stat-value">{notifications.length}</span>
              <span className="hn-stat-label">Total</span>
            </div>
            {unreadCount > 0 && (
              <div className="hn-stat hn-stat-unread">
                <span className="hn-stat-value">{unreadCount}</span>
                <span className="hn-stat-label">Unread</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Not logged in ── */}
        {!loggedIn && (
          <div className="hn-login-prompt">
            <div className="hn-login-icon">🔔</div>
            <h2>Sign in to see your notifications</h2>
            <p>Your personal activity feed from all SmartCampus modules will appear here once you're logged in.</p>
            <button
              className="hn-login-btn"
              type="button"
              onClick={() => navigate("/m4/login")}
            >
              Sign in →
            </button>
          </div>
        )}

        {/* ── Logged in content ── */}
        {loggedIn && (
          <>
            {/* Filter tabs */}
            <div className="hn-filters">
              {FILTERS.map(({ key, label }) => {
                const count = key === "All"
                  ? notifications.length
                  : notifications.filter((n) => n.source === key).length;
                const sm = key !== "All" ? sourceMeta(key) : null;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`hn-filter-tab${filter === key ? " active" : ""}`}
                    style={filter === key && sm
                      ? { background: sm.bg, color: sm.color, borderColor: sm.color + "50" }
                      : {}}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                    {count > 0 && (
                      <span className="hn-filter-count">{count}</span>
                    )}
                  </button>
                );
              })}
              {visibleUnread > 0 && (
                <button
                  type="button"
                  className="hn-mark-visible-btn"
                  onClick={markAllRead}
                  disabled={loading}
                >
                  ✓ Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="hn-list-card">
              <div className="hn-list-header">
                <span className="hn-list-title">
                  {filter === "All" ? "All Notifications" : `${FILTERS.find(f => f.key === filter)?.label} Notifications`}
                </span>
                {visibleUnread > 0 && (
                  <span className="hn-unread-badge">{visibleUnread} unread</span>
                )}
              </div>

              {visible.length === 0 ? (
                <div className="hn-empty">
                  <div className="hn-empty-icon">🔔</div>
                  <h3>No notifications yet</h3>
                  <p>
                    {filter === "All"
                      ? "Activity from bookings, tickets, resources, and auth will appear here."
                      : `No ${FILTERS.find(f => f.key === filter)?.label} notifications yet.`}
                  </p>
                </div>
              ) : (
                <ul className="hn-notif-list" role="list">
                  {visible.map((n) => {
                    const { icon, label, color } = typeMeta(n.type);
                    const sm = sourceMeta(n.source);
                    return (
                      <li
                        key={n.id}
                        className={`hn-notif-item${n.read ? "" : " hn-notif-item--unread"}`}
                      >
                        {/* Type icon */}
                        <span
                          className="hn-notif-icon"
                          style={{ background: `${color}15`, color }}
                          aria-hidden="true"
                        >
                          {icon}
                        </span>

                        {/* Body */}
                        <div className="hn-notif-body">
                          <div className="hn-notif-top">
                            <strong>{n.title}</strong>
                            <span
                              className="hn-type-badge"
                              style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                            >
                              {label}
                            </span>
                            <span
                              className="hn-source-badge"
                              style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}
                            >
                              {sm.label}
                            </span>
                            {!n.read && <span className="hn-unread-dot" aria-label="Unread" />}
                          </div>
                          <p>{n.message}</p>
                          <div className="hn-notif-footer">
                            <span className="hn-notif-time" title={formatDateTime(n.createdAt)}>
                              {relativeTime(n.createdAt)}
                            </span>
                            <span className="hn-notif-time-full">{formatDateTime(n.createdAt)}</span>
                          </div>
                        </div>

                        {/* Mark read */}
                        {!n.read && (
                          <button
                            type="button"
                            className="hn-mark-read-btn"
                            onClick={() => markRead(n.id)}
                            aria-label="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
