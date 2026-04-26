import React, { useState } from "react";

// ── Type metadata ──────────────────────────────────────────────────────────
const TYPE_META = {
  // M4 — Auth
  login:       { icon: "🔑", label: "Sign-in",      color: "#6366f1" },
  register:    { icon: "🎉", label: "Registration",  color: "#16a34a" },
  role_change: { icon: "👑", label: "Role Change",   color: "#d97706" },
  security:    { icon: "🛡️", label: "Security",      color: "#0ea5e9" },
  system:      { icon: "⚙️", label: "System",        color: "#6b7280" },
  // M2 — Booking
  booking:     { icon: "📅", label: "Booking",       color: "#8b5cf6" },
  // M1 — Resource
  resource:    { icon: "🏛️", label: "Resource",      color: "#10b981" },
  // M3 — Ticket
  ticket:      { icon: "🎫", label: "Ticket",        color: "#f59e0b" },
};

const SOURCE_META = {
  M4: { label: "Auth",      color: "#6366f1", bg: "#eef2ff" },
  M2: { label: "Booking",   color: "#8b5cf6", bg: "#f5f3ff" },
  M1: { label: "Resources", color: "#10b981", bg: "#f0fdf4" },
  M3: { label: "Tickets",   color: "#f59e0b", bg: "#fffbeb" },
};

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

const ALL_SOURCES = ["All", "M4", "M2", "M1", "M3"];
const SOURCE_LABELS = { All: "All", M4: "Auth (M4)", M2: "Booking (M2)", M1: "Resources (M1)", M3: "Tickets (M3)" };

/**
 * Full-page notification list for the M4 Dashboard.
 * Props: { notifications, unreadCount, loading, markRead, markAllRead }
 */
export default function NotificationsPage({ notifications, unreadCount, loading, markRead, markAllRead }) {
  const [filter, setFilter] = useState("All");

  const visible = filter === "All"
    ? notifications
    : notifications.filter((n) => n.source === filter);

  const visibleUnread = visible.filter((n) => !n.read).length;

  return (
    <div className="db-content">

      {/* Hero banner */}
      <div className="db-welcome-banner">
        <div className="db-banner-left">
          <div className="db-banner-tag">
            <span className="db-banner-tag-dot" />
            ALL MODULES · ACTIVITY FEED
          </div>
          <h2>Notifications</h2>
          <p>Your unified activity log — auth, bookings, resources, and tickets.</p>
          <div className="db-banner-actions">
            {unreadCount > 0 && (
              <button className="db-banner-btn" onClick={markAllRead} disabled={loading}>
                ✓ Mark all as read
              </button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
            🔔
          </div>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem", fontWeight: 700 }}>{notifications.length} total</span>
          {unreadCount > 0 && (
            <span style={{ background: "#ef4444", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 800 }}>
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Module source filter tabs */}
      <div className="m4-notif-filter-row">
        {ALL_SOURCES.map((src) => {
          const sm = src !== "All" ? sourceMeta(src) : null;
          const count = src === "All"
            ? notifications.length
            : notifications.filter((n) => n.source === src).length;
          return (
            <button
              key={src}
              type="button"
              className={`m4-notif-filter-tab${filter === src ? " active" : ""}`}
              style={filter === src && sm ? { background: sm.bg, color: sm.color, borderColor: sm.color + "40" } : {}}
              onClick={() => setFilter(src)}
            >
              {SOURCE_LABELS[src]}
              {count > 0 && <span className="m4-notif-filter-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* List card */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">
            {filter === "All" ? "All Notifications" : `${SOURCE_LABELS[filter]} Notifications`}
          </span>
          {visibleUnread > 0 && (
            <button
              className="db-action-btn db-action-secondary"
              style={{ fontSize: "0.78rem", padding: "6px 14px" }}
              onClick={markAllRead}
              disabled={loading}
            >
              {loading ? "Marking…" : "✓ Mark all read"}
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🔔</div>
            <p style={{ fontWeight: 600, color: "#475569" }}>No notifications here yet</p>
            <p style={{ fontSize: "0.85rem", marginTop: 4 }}>
              {filter === "All"
                ? "Activity like sign-ins, bookings, and ticket updates will appear here."
                : `No ${SOURCE_LABELS[filter]} notifications yet.`}
            </p>
          </div>
        ) : (
          <ul className="m4-notif-full-list" role="list">
            {visible.map((n) => {
              const { icon, label, color } = typeMeta(n.type);
              const sm = sourceMeta(n.source);
              return (
                <li
                  key={n.id}
                  className={`m4-notif-full-item${n.read ? "" : " m4-notif-full-item--unread"}`}
                >
                  <span
                    className="m4-notif-full-icon"
                    style={{ background: `${color}15`, color }}
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  <div className="m4-notif-full-body">
                    <div className="m4-notif-full-top">
                      <strong>{n.title}</strong>
                      {/* Type badge */}
                      <span
                        className="m4-notif-type-badge"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                      >
                        {label}
                      </span>
                      {/* Source module badge */}
                      <span
                        className="m4-notif-source-badge"
                        style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.color}30` }}
                      >
                        {sm.label}
                      </span>
                      {!n.read && <span className="m4-notif-unread-dot" aria-label="Unread" />}
                    </div>
                    <p>{n.message}</p>
                    <span className="m4-notif-full-time">{formatDateTime(n.createdAt)}</span>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      className="db-action-btn db-action-secondary"
                      style={{ fontSize: "0.75rem", padding: "5px 12px", whiteSpace: "nowrap", flexShrink: 0 }}
                      onClick={() => markRead(n.id)}
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
    </div>
  );
}
