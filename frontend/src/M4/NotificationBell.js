import React, { useEffect, useRef, useState } from "react";

const TYPE_META = {
  // M4 — Auth
  login:       { icon: "🔑", color: "#6366f1" },
  register:    { icon: "🎉", color: "#16a34a" },
  role_change: { icon: "👑", color: "#d97706" },
  security:    { icon: "🛡️", color: "#0ea5e9" },
  system:      { icon: "⚙️", color: "#6b7280" },
  // M2 — Booking
  booking:     { icon: "📅", color: "#8b5cf6" },
  // M1 — Resource
  resource:    { icon: "🏛️", color: "#10b981" },
  // M3 — Ticket
  ticket:      { icon: "🎫", color: "#f59e0b" },
};

const SOURCE_META = {
  M4: { label: "Auth",      color: "#6366f1" },
  M2: { label: "Booking",   color: "#8b5cf6" },
  M1: { label: "Resources", color: "#10b981" },
  M3: { label: "Tickets",   color: "#f59e0b" },
};

function typeMeta(type) {
  return TYPE_META[type] || { icon: "🔔", color: "#6366f1" };
}

function sourceMeta(source) {
  return SOURCE_META[source] || { label: source || "System", color: "#6b7280" };
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

/**
 * Bell icon + dropdown panel for M4 notifications (all modules).
 * Props: { notifications, unreadCount, loading, markRead, markAllRead, onViewAll }
 */
export default function NotificationBell({
  notifications,
  unreadCount,
  loading,
  markRead,
  markAllRead,
  onViewAll,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const preview = notifications.slice(0, 6);

  return (
    <div className="m4-notif-wrapper" ref={ref}>
      {/* Bell trigger */}
      <button
        type="button"
        className="m4-notif-bell"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="m4-notif-count" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="m4-notif-panel" role="dialog" aria-label="Notifications">
          {/* Header */}
          <div className="m4-notif-panel-header">
            <div>
              <span>Notifications</span>
              <span style={{ marginLeft: 6, fontSize: "0.72rem", color: "#94a3b8", fontWeight: 500 }}>
                All modules
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="m4-notif-text-btn"
                  onClick={markAllRead}
                  disabled={loading}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="m4-notif-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* List */}
          <ul className="m4-notif-list" role="list">
            {preview.length === 0 ? (
              <li className="m4-notif-empty">No notifications yet</li>
            ) : (
              preview.map((n) => {
                const { icon, color } = typeMeta(n.type);
                const sm = sourceMeta(n.source);
                return (
                  <li
                    key={n.id}
                    className={`m4-notif-item${n.read ? "" : " m4-notif-item--unread"}`}
                  >
                    <span
                      className="m4-notif-item-icon"
                      style={{ background: `${color}18`, color }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <div className="m4-notif-item-body">
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                        <strong style={{ fontSize: "0.82rem" }}>{n.title}</strong>
                        {n.source && (
                          <span
                            style={{
                              fontSize: "0.62rem", fontWeight: 700,
                              padding: "1px 6px", borderRadius: 999,
                              background: `${sm.color}15`, color: sm.color,
                              border: `1px solid ${sm.color}25`,
                              lineHeight: 1.4,
                            }}
                          >
                            {sm.label}
                          </span>
                        )}
                      </div>
                      <p>{n.message}</p>
                      <span className="m4-notif-item-time">{relativeTime(n.createdAt)}</span>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        className="m4-notif-read-btn"
                        onClick={() => markRead(n.id)}
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="m4-notif-panel-footer">
              <button
                type="button"
                className="m4-notif-text-btn"
                onClick={() => { setOpen(false); onViewAll?.(); }}
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
