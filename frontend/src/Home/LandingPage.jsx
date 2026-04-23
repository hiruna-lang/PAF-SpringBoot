import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../M4/authService";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  // If already logged in, redirect to the right place
  useEffect(() => {
    if (isLoggedIn()) {
      const role = getRole();
      if (role === "ADMIN") navigate("/m4/admin", { replace: true });
      else if (role === "TECHNICIAN") navigate("/m3", { replace: true });
      else navigate("/m4/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="lp-root">
      {/* Background orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-brand">
          <div className="lp-brand-icon">SC</div>
          <span className="lp-brand-name">SmartCampus</span>
        </div>
        <div className="lp-nav-actions">
          <button className="lp-btn-ghost" onClick={() => navigate("/home")}>
            Explore
          </button>
          <button className="lp-btn-outline" onClick={() => navigate("/m4/login")}>
            Sign In
          </button>
          <button className="lp-btn-primary" onClick={() => navigate("/m4/register")}>
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Unified campus operations platform
          </div>

          <h1 className="lp-title">
            The smarter way to
            <span className="lp-gradient"> run your campus</span>
          </h1>

          <p className="lp-sub">
            SmartCampus brings resources, bookings, support tickets, and secure
            access into one connected platform — built for students, staff, and
            administrators.
          </p>

          <div className="lp-cta-row">
            <button
              className="lp-btn-hero-primary"
              onClick={() => navigate("/m4/register")}
            >
              Get Started Free →
            </button>
            <button
              className="lp-btn-hero-secondary"
              onClick={() => navigate("/m4/login")}
            >
              Sign In
            </button>
          </div>

          <p className="lp-hint">No credit card required · Free to use</p>
        </div>

        {/* Role cards */}
        <div className="lp-role-cards">
          <div className="lp-role-card lp-role-user">
            <div className="lp-role-tag">USER</div>
            <h3>Request Studio</h3>
            <p>
              Raise issues, attach visual evidence, and follow every operational
              update from one polished workspace.
            </p>
            <span className="lp-role-hint">Best for students, staff, and request owners</span>
            <button
              className="lp-role-btn"
              onClick={() => navigate("/m4/register")}
            >
              Enter Workspace
            </button>
          </div>

          <div className="lp-role-card lp-role-admin">
            <div className="lp-role-tag lp-role-tag-admin">ADMIN</div>
            <h3>Control Deck</h3>
            <p>
              Direct triage, assign technicians, manage escalations, and keep
              the queue moving with confidence.
            </p>
            <span className="lp-role-hint">Best for service desk and operations leads</span>
            <button
              className="lp-role-btn lp-role-btn-admin"
              onClick={() => navigate("/m4/login")}
            >
              Enter Workspace
            </button>
          </div>

          <div className="lp-role-card lp-role-tech">
            <div className="lp-role-tag lp-role-tag-tech">TECHNICIAN</div>
            <h3>Field Console</h3>
            <p>
              Open assigned work, post progress updates, and close the loop with
              structured resolution notes.
            </p>
            <span className="lp-role-hint">Best for execution teams and on-site responders</span>
            <button
              className="lp-role-btn lp-role-btn-tech"
              onClick={() => navigate("/m4/login")}
            >
              Enter Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="lp-stats">
        {[
          { value: "92%", label: "Faster service resolution" },
          { value: "4x",  label: "Resource visibility" },
          { value: "24/7", label: "Student access" },
          { value: "1 Hub", label: "Unified campus tooling" },
        ].map((s) => (
          <div className="lp-stat" key={s.label}>
            <div className="lp-stat-value">{s.value}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="lp-features">
        <div className="lp-section-label">What you get</div>
        <h2 className="lp-section-title">Every campus workflow, beautifully aligned</h2>
        <div className="lp-features-grid">
          {[
            { icon: "⚡", title: "Instant routing",       copy: "Route tickets, requests, and approvals without inbox chaos." },
            { icon: "🧭", title: "Centralized navigation", copy: "Launch every module from a single, calm control surface." },
            { icon: "📊", title: "Live reporting",         copy: "See what is trending, blocked, or underutilised in minutes." },
            { icon: "🔔", title: "Proactive alerts",       copy: "Stay ahead with real-time signals on service issues." },
            { icon: "🛡️", title: "Secure by default",      copy: "OAuth + role-based access keeps every interaction trusted." },
            { icon: "🌿", title: "Sustainable ops",        copy: "Reduce duplicated work and keep teams focused on people." },
          ].map((f) => (
            <div className="lp-feature-card" key={f.title}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="lp-final-cta">
        <div className="lp-final-cta-card">
          <h2>Ready to get started?</h2>
          <p>Create your free account and join your campus community today.</p>
          <div className="lp-cta-row">
            <button
              className="lp-btn-hero-primary"
              onClick={() => navigate("/m4/register")}
            >
              Create Account →
            </button>
            <button
              className="lp-btn-hero-secondary"
              onClick={() => navigate("/m4/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-brand">
          <div className="lp-brand-icon">SC</div>
          <span className="lp-brand-name">SmartCampus</span>
        </div>
        <p className="lp-footer-copy">Built for modern universities and empowered teams.</p>
        <ul className="lp-footer-links">
          <li><button onClick={() => navigate("/home")}>Explore</button></li>
          <li><button onClick={() => navigate("/m4/login")}>Sign In</button></li>
          <li><button onClick={() => navigate("/m4/register")}>Sign Up</button></li>
        </ul>
      </footer>
    </div>
  );
}
