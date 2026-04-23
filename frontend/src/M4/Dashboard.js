import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, getToken, logout, isLoggedIn, isAdmin, savePhoto, savePhotoToServer, loadProfileFromServer, getUserId } from "./authService";
import { useNotifications } from "./useNotifications";
import NotificationBell from "./NotificationBell";
import NotificationsPage from "./NotificationsPage";
import "./Dashboard.css";

function decodeJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

function formatExpiry(s) {
  if (s <= 0) return "Expired";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const QUICK_LINKS = [
  { icon: "📚", label: "Courses",   desc: "Browse & manage courses",     path: "/m1", color: "#6366f1" },
  { icon: "👥", label: "Students",  desc: "Student portal & enrollment", path: "/m2", color: "#8b5cf6" },
  { icon: "📊", label: "Reports",   desc: "Analytics & performance",     path: "/m3", color: "#ec4899" },
  { icon: "🔐", label: "Security",  desc: "Auth settings & roles",       path: "/m4", color: "#10b981" },
];

const ACTIVITY = [
  { icon: "🔑", text: "Signed in successfully",         time: "Just now",    color: "#6366f1" },
  { icon: "🌐", text: "Google OAuth2 authentication",   time: "Just now",    color: "#10b981" },
  { icon: "🛡️", text: "Role assigned: USER",            time: "Just now",    color: "#f59e0b" },
  { icon: "📋", text: "Session token generated",        time: "Just now",    color: "#8b5cf6" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = getUser();
  const token    = getToken();

  const [now, setNow]               = useState(new Date());
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const p = decodeJwt(token);
    return p?.exp ? p.exp - Math.floor(Date.now() / 1000) : 0;
  });

  // Read ?tab= from URL on first render, default to "overview"
  const initialTab = new URLSearchParams(location.search).get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [photo, setPhoto]         = useState(user?.photoUrl || null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMsg, setPhotoMsg]   = useState("");
  const fileInputRef              = useRef(null);

  // Notifications
  const { notifications, unreadCount, loading: notifLoading, markRead, markAllRead } = useNotifications();

  // Load latest photo from server on mount (in case it was saved in a previous session)
  useEffect(() => {
    loadProfileFromServer().then(() => {
      const fresh = JSON.parse(localStorage.getItem("user") || "{}");
      if (fresh.photoUrl) setPhoto(fresh.photoUrl);
    });
  }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size — max 2MB
    if (file.size > 2 * 1024 * 1024) {
      setPhotoMsg("❌ Image too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      savePhoto(dataUrl); // instant local update

      // Save to server
      setPhotoSaving(true);
      setPhotoMsg("");
      try {
        await savePhotoToServer(dataUrl);
        setPhotoMsg("✅ Photo saved!");
      } catch {
        setPhotoMsg("❌ Failed to save. Try again.");
      } finally {
        setPhotoSaving(false);
        setTimeout(() => setPhotoMsg(""), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/m4/login", { replace: true }); return; }
    const timer = setInterval(() => {
      setNow(new Date());
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timer); logout(); navigate("/m4/login"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  if (!user) return null;

  const initial   = user.name ? user.name.charAt(0).toUpperCase() : "?";
  const firstName = user.name ? user.name.split(" ")[0] : "User";
  const userId    = getUserId() || user.userId || "—";
  const loginTime = localStorage.getItem("loginTime");
  const loginDisplay = loginTime
    ? new Date(Number(loginTime)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const expiryPct = (() => {
    const p = decodeJwt(token);
    if (!p?.exp || !p?.iat) return 100;
    const total = p.exp - p.iat;
    return Math.max(0, Math.min(100, (secondsLeft / total) * 100));
  })();
  const expiryColor = secondsLeft < 600 ? "#ef4444" : secondsLeft < 3600 ? "#f59e0b" : "#6366f1";
  const roleBadgeClass = user.role === "ADMIN" ? "db-badge-admin" : user.role === "TECHNICIAN" ? "db-badge-technician" : "db-badge-user";

  return (
    <div className="db-root">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <div className="db-brand-icon">🎓</div>
          <span className="db-brand-name">SmartCampus</span>
        </div>

        <nav className="db-nav">
          {[
            { id: "overview",       icon: "🏠", label: "Overview" },
            { id: "profile",        icon: "👤", label: "Profile" },
            { id: "modules",        icon: "📦", label: "Modules" },
            { id: "security",       icon: "🔐", label: "Security" },
            { id: "notifications",  icon: "🔔", label: "Notifications", badge: unreadCount > 0 ? unreadCount : null },
          ].map(item => (
            <button
              key={item.id}
              className={`db-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge != null && (
                <span className="db-nav-badge">{item.badge > 99 ? "99+" : item.badge}</span>
              )}
            </button>
          ))}

          {isAdmin() && (
            <button className="db-nav-item db-nav-admin" onClick={() => navigate("/m4/admin")}>
              <span className="db-nav-icon">👑</span>
              <span>Admin Panel</span>
            </button>
          )}
        </nav>

        <div className="db-sidebar-footer">
          <button className="db-nav-item" onClick={() => navigate("/home")}>
            <span className="db-nav-icon">🌐</span>
            <span>Home</span>
          </button>
          <button className="db-nav-item db-nav-logout" onClick={() => { logout(); navigate("/m4/login"); }}>
            <span className="db-nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
        {/* User card at bottom */}
        <div className="db-sidebar-user" onClick={() => setActiveTab("profile")}>
          <div className="db-sidebar-user-avatar">
            {photo ? <img src={photo} alt="avatar" /> : initial}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="db-sidebar-user-name">{user.name || user.email}</div>
            <div className="db-sidebar-user-role">{user.role}</div>
          </div>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="db-main">

        {/* Top bar */}
        <header className="db-topbar">
          <div>
            <h1 className="db-topbar-title">
              {activeTab === "overview"      && "Dashboard"}
              {activeTab === "profile"       && "My Profile"}
              {activeTab === "modules"       && "Modules"}
              {activeTab === "security"      && "Security"}
              {activeTab === "notifications" && "Notifications"}
            </h1>
            <p className="db-topbar-sub">
              {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="db-topbar-right">
            <div className="db-clock">{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notifLoading}
              markRead={markRead}
              markAllRead={markAllRead}
              onViewAll={() => setActiveTab("notifications")}
            />
            <div className="db-topbar-avatar" onClick={() => setActiveTab("profile")}>
              {photo
                ? <img src={photo} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : initial}
            </div>
          </div>
        </header>

        {/* ── OVERVIEW TAB ─────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="db-content">

            {/* Welcome banner */}
            <div className="db-welcome-banner">
              <div className="db-banner-left">
                <div className="db-banner-tag">
                  <span className="db-banner-tag-dot" />
                  STUDENT PORTAL · {user.role}
                </div>
                <h2>Good {getGreeting()}, {firstName}!</h2>
                <p>{user.email}</p>
                <div className="db-banner-actions">
                  <button className="db-banner-btn" onClick={() => setActiveTab("profile")}>👤 My Profile</button>
                  <button className="db-banner-btn" onClick={() => setActiveTab("modules")}>📦 Modules</button>
                  <button className="db-banner-btn" onClick={() => setActiveTab("security")}>🔐 Security</button>
                </div>
              </div>
              <div className="db-welcome-avatar">
                {photo
                  ? <img src={photo} alt="avatar" />
                  : initial}
              </div>
            </div>

            {/* Stat cards */}
            <div className="db-stats-row">
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>🪪</div>
                <div>
                  <div className="db-stat-value" style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>{userId}</div>
                  <div className="db-stat-label">Your ID</div>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>🔑</div>
                <div>
                  <div className="db-stat-value">{loginDisplay}</div>
                  <div className="db-stat-label">Logged In At</div>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>🛡️</div>
                <div>
                  <div className="db-stat-value">{user.role}</div>
                  <div className="db-stat-label">Your Role</div>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: "rgba(236,72,153,0.12)", color: "#ec4899" }}>🌐</div>
                <div>
                  <div className="db-stat-value">{user.provider === "GOOGLE" ? "Google" : "Local"}</div>
                  <div className="db-stat-label">Auth Provider</div>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: expiryColor }}>⏱</div>
                <div>
                  <div className="db-stat-value" style={{ color: expiryColor }}>{formatExpiry(secondsLeft)}</div>
                  <div className="db-stat-label">Session Expires</div>
                </div>
              </div>
            </div>

            {/* Token progress */}
            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Session Token</span>
                <span style={{ fontSize: "0.8rem", color: expiryColor, fontWeight: 600 }}>{formatExpiry(secondsLeft)} remaining</span>
              </div>
              <div className="db-progress-track">
                <div className="db-progress-fill" style={{ width: `${expiryPct}%`, background: `linear-gradient(90deg, ${expiryColor}, #8b5cf6)` }} />
              </div>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "8px" }}>
                Your session will automatically expire and log you out when the token reaches 0.
              </p>
            </div>

            {/* Quick access — circular icons */}
            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Quick Access</span>
              </div>
              <div className="db-quick-circles">
                {QUICK_LINKS.map((q, i) => (
                  <button key={i} className="db-quick-circle" onClick={() => navigate(q.path)}>
                    <div className="db-quick-circle-icon" style={{ background: `${q.color}18`, border: `2px solid ${q.color}30` }}>
                      {q.icon}
                    </div>
                    <span className="db-quick-circle-label">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Recent Activity</span>
              </div>
              <div className="db-activity-list">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="db-activity-item">
                    <div className="db-activity-dot" style={{ background: a.color }} />
                    <span className="db-activity-icon">{a.icon}</span>
                    <span className="db-activity-text">{a.text}</span>
                    <span className="db-activity-time">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="db-content">
            <div className="db-card db-profile-card">
              {/* Avatar with upload */}
              <div className="db-profile-photo-wrapper">
                <div className="db-profile-avatar-ring">
                  <div className="db-profile-avatar">
                    {photo
                      ? <img src={photo} alt="profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      : initial}
                  </div>
                </div>
                <button
                  className="db-photo-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change profile photo"
                >
                  {photoSaving ? "⏳" : "📷"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handlePhotoChange}
                />
              </div>
              <h2 className="db-profile-name">{user.name || "—"}</h2>
              <p className="db-profile-email">{user.email}</p>
              {photoMsg && (
                <p style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: photoMsg.startsWith("✅") ? "#15803d" : "#dc2626",
                  marginBottom: "10px",
                  background: photoMsg.startsWith("✅") ? "#dcfce7" : "#fef2f2",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  display: "inline-block"
                }}>
                  {photoMsg}
                </p>
              )}
              <div className="db-profile-badges">
                <span className={`db-badge ${roleBadgeClass}`}>
                  {user.role === "ADMIN" ? "👑" : user.role === "TECHNICIAN" ? "🔧" : "👤"} {user.role}
                </span>
                <span className={`db-badge ${user.provider === "GOOGLE" ? "db-badge-google" : "db-badge-local"}`}>
                  {user.provider === "GOOGLE" ? "🔵 Google" : "🔒 Local"}
                </span>
              </div>

              {/* Upload button below badges */}
              <button
                className="db-action-btn db-action-secondary"
                style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={photoSaving}
              >
                {photoSaving ? "⏳ Saving…" : "📷 Change Photo"}
              </button>
            </div>

            <div className="db-card">
              <div className="db-card-header"><span className="db-card-title">Account Details</span></div>
              <div className="db-detail-list">
                {[
                  { label: "User ID",     value: userId },
                  { label: "Full Name",   value: user.name  || "—" },
                  { label: "Email",       value: user.email },
                  { label: "Role",        value: user.role  || "USER" },
                  { label: "Provider",    value: user.provider },
                  { label: "Logged In",   value: loginDisplay },
                  { label: "Session",     value: formatExpiry(secondsLeft) },
                ].map((d, i) => (
                  <div key={i} className="db-detail-row">
                    <span className="db-detail-label">{d.label}</span>
                    <span className="db-detail-value">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MODULES TAB ──────────────────────────────── */}
        {activeTab === "modules" && (
          <div className="db-content">
            <div className="db-modules-grid">
              {QUICK_LINKS.map((q, i) => (
                <div key={i} className="db-module-card" onClick={() => navigate(q.path)}>
                  <div className="db-module-icon" style={{ background: `${q.color}18`, color: q.color }}>{q.icon}</div>
                  <h3>{q.label}</h3>
                  <p>{q.desc}</p>
                  <span className="db-module-arrow" style={{ color: q.color }}>Open →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ─────────────────────────────── */}
        {activeTab === "security" && (
          <div className="db-content">
            <div className="db-card">
              <div className="db-card-header"><span className="db-card-title">Session Security</span></div>
              <div className="db-detail-list">
                <div className="db-detail-row">
                  <span className="db-detail-label">Auth Method</span>
                  <span className="db-detail-value">{user.provider === "GOOGLE" ? "OAuth2 / Google" : "Email & Password"}</span>
                </div>
                <div className="db-detail-row">
                  <span className="db-detail-label">Token Type</span>
                  <span className="db-detail-value">JWT (HS256)</span>
                </div>
                <div className="db-detail-row">
                  <span className="db-detail-label">Token Expiry</span>
                  <span className="db-detail-value" style={{ color: expiryColor }}>{formatExpiry(secondsLeft)}</span>
                </div>
                <div className="db-detail-row">
                  <span className="db-detail-label">Role</span>
                  <span className="db-detail-value">{user.role}</span>
                </div>
                <div className="db-detail-row">
                  <span className="db-detail-label">Session Start</span>
                  <span className="db-detail-value">{loginDisplay}</span>
                </div>
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header"><span className="db-card-title">Actions</span></div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="db-action-btn db-action-danger"
                  onClick={() => { logout(); navigate("/m4/login"); }}>
                  🚪 Sign Out
                </button>
                <button className="db-action-btn db-action-secondary"
                  onClick={() => navigate("/m4/login")}>
                  🔄 Re-authenticate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ────────────────────────── */}
        {activeTab === "notifications" && (
          <NotificationsPage
            notifications={notifications}
            unreadCount={unreadCount}
            loading={notifLoading}
            markRead={markRead}
            markAllRead={markAllRead}
          />
        )}
      </main>
    </div>
  );
}
