import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, getToken, logout, isLoggedIn, isAdmin } from "./authService";
import "./M4.css";

function decodeJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); }
  catch { return null; }
}

function formatExpiry(s) {
  if (s <= 0) return "Expired";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();
  const token    = getToken();

  // Live clock — updates every second
  const [now, setNow] = useState(new Date());

  // Token expiry countdown
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const p = decodeJwt(token);
    return p?.exp ? p.exp - Math.floor(Date.now() / 1000) : 0;
  });

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/m4/login", { replace: true }); return; }

    // Tick every second — updates both clock and countdown
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

  // Clock parts
  const timeStr = now.toLocaleTimeString("en-US", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    year:    "numeric",
  });

  const initial      = user.name ? user.name.charAt(0).toUpperCase() : "?";
  const firstName    = user.name ? user.name.split(" ")[0] : "User";
  const providerWord = user.provider === "GOOGLE" ? "Google" : "Local";
  const loginTime    = localStorage.getItem("loginTime");
  const loginDisplay = loginTime
    ? new Date(Number(loginTime)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const expiryColor  = secondsLeft < 600 ? "#ef4444" : secondsLeft < 3600 ? "#f59e0b" : "#6366f1";

  const roleBadgeClass =
    user.role === "ADMIN"   ? "badge-admin"   :
    user.role === "MANAGER" ? "badge-manager" : "badge-local";

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">

        {/* ── Live clock ─────────────────────────────────── */}
        <div className="live-clock">
          <div className="live-clock-time">{timeStr}</div>
          <div className="live-clock-date">{dateStr}</div>
        </div>

        {/* ── Avatar ─────────────────────────────────────── */}
        <div className="avatar-ring">
          <div className="avatar">{initial}</div>
        </div>

        <h2>Hello, {firstName}! 👋</h2>
        <p className="email">{user.email}</p>

        {/* Role + provider badges */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "16px" }}>
          <span className={`badge ${roleBadgeClass}`}>
            {user.role === "ADMIN" ? "👑" : user.role === "MANAGER" ? "🏢" : "👤"} {user.role}
          </span>
          <span className={`badge ${user.provider === "GOOGLE" ? "badge-google" : "badge-local"}`}>
            {user.provider === "GOOGLE" ? "🔵 Google" : "🔒 Local"}
          </span>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>{loginDisplay}</div>
            <div className="stat-label">Logged In</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>{providerWord}</div>
            <div className="stat-label">Provider</div>
          </div>
          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: "1rem", color: expiryColor }}>
              {formatExpiry(secondsLeft)}
            </div>
            <div className="stat-label">Expires In</div>
          </div>
        </div>

        {isAdmin() && (
          <button className="btn-primary" style={{ marginBottom: "12px" }}
            onClick={() => navigate("/m4/admin")}>
            👑 Admin Panel
          </button>
        )}

        <button className="btn-logout" onClick={() => { logout(); navigate("/m4/login"); }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
