import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../M4/useNotifications";
import { isLoggedIn, getUser } from "../M4/authService";
import "./Home.css";

// ── Type metadata for the dropdown ────────────────────────
const TYPE_ICON = {
  login: "🔑", register: "🎉", role_change: "👑",
  security: "🛡️", system: "⚙️", booking: "📅",
  resource: "🏛️", ticket: "🎫",
};
const SOURCE_COLOR = {
  M4: "#6366f1", M2: "#8b5cf6", M1: "#10b981", M3: "#f59e0b",
};
const SOURCE_LABEL = {
  M4: "Auth", M2: "Booking", M1: "Resources", M3: "Tickets",
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function NavBell({ navigate }) {
  const loggedIn = isLoggedIn();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();
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

  if (!loggedIn) {
    return (
      <button
        className="nav-icon-btn"
        type="button"
        onClick={() => navigate("/m4/login")}
        aria-label="Sign in to see notifications"
        title="Sign in to see notifications"
      >
        <span className="nav-icon">🔔</span>
      </button>
    );
  }

  const preview = notifications.slice(0, 5);

  return (
    <div className="nav-bell-wrapper" ref={ref}>
      <button
        className="nav-icon-btn"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        title="Notifications"
      >
        <span className="nav-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="nav-notification-dot" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="nav-notif-panel" role="dialog" aria-label="Notifications">
          {/* Header */}
          <div className="nav-notif-header">
            <div>
              <span className="nav-notif-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="nav-notif-count-badge">{unreadCount} unread</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="nav-notif-text-btn"
                  onClick={markAllRead}
                  disabled={loading}
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                className="nav-notif-close"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* List */}
          <ul className="nav-notif-list" role="list">
            {preview.length === 0 ? (
              <li className="nav-notif-empty">No notifications yet</li>
            ) : (
              preview.map((n) => {
                const icon = TYPE_ICON[n.type] || "🔔";
                const srcColor = SOURCE_COLOR[n.source] || "#6b7280";
                const srcLabel = SOURCE_LABEL[n.source] || n.source || "System";
                return (
                  <li
                    key={n.id}
                    className={`nav-notif-item${n.read ? "" : " nav-notif-item--unread"}`}
                  >
                    <span
                      className="nav-notif-item-icon"
                      style={{ background: `${srcColor}15`, color: srcColor }}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <div className="nav-notif-item-body">
                      <div className="nav-notif-item-top">
                        <strong>{n.title}</strong>
                        <span
                          className="nav-notif-src"
                          style={{ background: `${srcColor}15`, color: srcColor }}
                        >
                          {srcLabel}
                        </span>
                      </div>
                      <p>{n.message}</p>
                      <span className="nav-notif-time">{relativeTime(n.createdAt)}</span>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        className="nav-notif-read-btn"
                        onClick={() => markRead(n.id)}
                        aria-label="Mark as read"
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
          <div className="nav-notif-footer">
            <button
              type="button"
              className="nav-notif-text-btn"
              onClick={() => { setOpen(false); navigate("/notifications"); }}
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    const targets = document.querySelectorAll(".reveal");
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.2 }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home">
      <nav className="nav">
        <a className="nav-brand" href="#top">
          <span className="nav-brand-icon">SC</span>
          <span className="nav-brand-name">SmartCampus</span>
        </a>

        <div className="nav-center">
          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/resources")}
          >
            Resources
          </button>

          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/m2?tab=my-bookings")}
          >
            My Booking
          </button>

          <button
            className="nav-menu-btn nav-menu-highlight"
            type="button"
            onClick={() => navigate("/create-ticket")}
          >
            Create Ticket
          </button>
        </div>

        <div className="nav-icons">
          <NavBell navigate={navigate} />

          <button
            className="nav-icon-btn nav-profile-btn"
            type="button"
            onClick={() => navigate(isLoggedIn() ? "/m4/dashboard" : "/m4/login")}
            aria-label="Profile"
            title={isLoggedIn() ? (user?.name || "Profile") : "Sign in"}
          >
            {isLoggedIn() && user?.photoUrl
              ? <img src={user.photoUrl} alt="avatar" className="nav-avatar-img" />
              : <span className="nav-icon">👤</span>}
          </button>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Unified campus operations, finally human
          </div>
          <h1>
            Run the campus like a
            <span className="gradient-text"> connected city</span>
          </h1>
          <p className="hero-sub">
            SmartCampus brings resources, student services, support tickets, and
            secure access into one calm dashboard. Everything is fast to launch,
            easy to track, and friendly to the people who use it.
          </p>
          <div className="hero-actions">
            <button
              className="btn-hero-primary"
              type="button"
              onClick={() => navigate("/m1")}
            >
              Explore Resources
            </button>
            <button
              className="btn-hero-secondary"
              type="button"
              onClick={() => navigate("/m3")}
            >
              View Ticketing
            </button>
          </div>
        </div>

        <div className="hero-mockup">
          <div className="hero-mockup-card">
            <div className="mockup-bar">
              <span className="mockup-dot mockup-dot-red" />
              <span className="mockup-dot mockup-dot-amber" />
              <span className="mockup-dot mockup-dot-green" />
              <span className="mockup-url">smartcampus.local/dashboard</span>
            </div>
            <div className="mockup-grid">
              <div className="mockup-tile">
                <div className="mockup-tile-icon">📚</div>
                <div className="mockup-tile-label">Resources</div>
                <div className="mockup-tile-value">128 Ready</div>
              </div>
              <div className="mockup-tile">
                <div className="mockup-tile-icon">🎫</div>
                <div className="mockup-tile-label">Tickets</div>
                <div className="mockup-tile-value">14 Open</div>
              </div>
              <div className="mockup-tile">
                <div className="mockup-tile-icon">🧑‍🎓</div>
                <div className="mockup-tile-label">Students</div>
                <div className="mockup-tile-value">2,430 Active</div>
              </div>
              <div className="mockup-tile mockup-tile-wide">
                <div className="mockup-tile-label">Live service health</div>
                <div className="mockup-progress-bar">
                  <div className="mockup-progress-fill" />
                </div>
              </div>
              <div className="mockup-tile">
                <div className="mockup-tile-icon">🔐</div>
                <div className="mockup-tile-label">Access</div>
                <div className="mockup-tile-value">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-band" id="impact">
        <div className="stats-grid reveal">
          <div>
            <div className="stat-item-value">92%</div>
            <div className="stat-item-label">Faster service resolution</div>
          </div>
          <div>
            <div className="stat-item-value">4x</div>
            <div className="stat-item-label">Resource visibility</div>
          </div>
          <div>
            <div className="stat-item-value">24/7</div>
            <div className="stat-item-label">Student access</div>
          </div>
          <div>
            <div className="stat-item-value">1 Hub</div>
            <div className="stat-item-label">Unified campus tooling</div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <span className="section-label">What you get</span>
        <h2 className="section-title">Every campus workflow, beautifully aligned</h2>
        <p className="section-sub">
          Built for admins, staff, and students. Everything is connected while
          staying secure and easy to manage.
        </p>

        <div className="features-grid">
          {[
            {
              icon: "⚡",
              title: "Instant routing",
              copy: "Route tickets, requests, and approvals without inbox chaos.",
            },
            {
              icon: "🧭",
              title: "Centralized navigation",
              copy: "Launch every module from a single, calm control surface.",
            },
            {
              icon: "📊",
              title: "Live reporting",
              copy: "See what is trending, blocked, or underutilized in minutes.",
            },
            {
              icon: "🔔",
              title: "Proactive alerts",
              copy: "Stay ahead with real-time signals on service issues.",
            },
            {
              icon: "🛡️",
              title: "Secure by default",
              copy: "OAuth + role-based access keeps every interaction trusted.",
            },
            {
              icon: "🌿",
              title: "Sustainable ops",
              copy: "Reduce duplicated work and keep teams focused on people.",
            },
          ].map((feature) => (
            <div className="feature-card reveal" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="modules" id="modules">
        <div className="modules-inner">
          <span className="section-label">Modules</span>
          <h2 className="section-title">Choose a module to jump in</h2>
          <p className="section-sub">
            Each module is designed to work on its own while sharing data across
            the campus ecosystem.
          </p>

          <div className="modules-grid">
            {[
              {
                label: "Module 01",
                icon: "📦",
                title: "Resources",
                copy: "Track labs, equipment, and shared assets in real time.",
                path: "/m1",
              },
              {
                label: "Module 02",
                icon: "🎓",
                title: "Student Hub",
                copy: "Give students a personal dashboard for campus life.",
                path: "/m2",
              },
              {
                label: "Module 03",
                icon: "🎫",
                title: "Support Desk",
                copy: "Log, assign, and resolve issues with full visibility.",
                path: "/m3",
              },
              {
                label: "Module 04",
                icon: "🔐",
                title: "Access & Auth",
                copy: "Manage authentication, roles, and secure access flows.",
                path: "/m4",
              },
            ].map((module) => (
              <button
                className="module-card reveal"
                type="button"
                key={module.title}
                onClick={() => navigate(module.path)}
              >
                <div className="module-card-content">
                  <div className="module-number">{module.label}</div>
                  <div className="module-icon">{module.icon}</div>
                  <h3>{module.title}</h3>
                  <p>{module.copy}</p>
                  <span className="module-btn">Open module →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" id="cta">
        <div className="cta-card reveal">
          <h2>Make the campus feel effortless</h2>
          <p>
            Launch SmartCampus today to unify data, workflows, and people in one
            place. Start with a module or explore the full suite.
          </p>
          <div className="cta-actions">
            <button
              className="btn-hero-primary"
              type="button"
              onClick={() => navigate("/m4")}
            >
              Start with Auth
            </button>
            <button
              className="btn-hero-secondary"
              type="button"
              onClick={() => navigate("/m1")}
            >
              Visit Resources
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <span className="nav-brand-icon">SC</span>
          <span className="nav-brand-name">SmartCampus</span>
        </div>
        <div className="footer-copy">
          Built for modern universities and empowered teams.
        </div>
        <ul className="footer-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#modules">Modules</a>
          </li>
          <li>
            <a href="#cta">Get started</a>
          </li>
        </ul>
      </footer>
    </div>
  );
}

export default Home;