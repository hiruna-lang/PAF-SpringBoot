import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, isAdmin } from '../M4/authService';
import './Home.css';

/* ── Scroll-reveal hook ─────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Feature data ───────────────────────────────────────── */
const FEATURES = [
  {
    icon: '🔐', color: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)',
    title: 'Secure Authentication',
    desc:  'JWT-based auth with Google OAuth2 sign-in. Role-based access control for USER, MANAGER, and ADMIN.',
  },
  {
    icon: '⚡', color: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)',
    title: 'Lightning Fast',
    desc:  'Spring Boot 4 backend with HikariCP connection pooling and React 19 frontend for instant responses.',
  },
  {
    icon: '🛡️', color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)',
    title: 'Role-Based Access',
    desc:  'Fine-grained permissions. Admins manage users, Managers access reports, Users get their workspace.',
  },
  {
    icon: '📊', color: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)',
    title: 'Real-Time Dashboard',
    desc:  'Live clock, token expiry countdown, session info, and user stats — all updating in real time.',
  },
  {
    icon: '🎨', color: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)',
    title: 'Glass UI Design',
    desc:  'Stunning glassmorphism interface with animated backgrounds, smooth transitions, and responsive layout.',
  },
  {
    icon: '🔄', color: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)',
    title: 'Auto Token Refresh',
    desc:  'Automatic session expiry detection with graceful logout and redirect — no stale sessions.',
  },
];

/* ── Module data ────────────────────────────────────────── */
const MODULES = [
  { num: 'Module 1', icon: '📚', title: 'Course Management',  desc: 'Manage courses, schedules, and academic content.',  path: '/m1' },
  { num: 'Module 2', icon: '👥', title: 'Student Portal',     desc: 'Student profiles, enrollment, and progress.',        path: '/m2' },
  { num: 'Module 3', icon: '📋', title: 'Reports & Analytics',desc: 'Insights, reports, and performance analytics.',      path: '/m3' },
  { num: 'Module 4', icon: '🔐', title: 'Auth & Security',    desc: 'Login, register, Google OAuth2, and RBAC.',          path: '/m4' },
];

/* ── Stats ──────────────────────────────────────────────── */
const STATS = [
  { value: '10K+', label: 'Active Students' },
  { value: '500+', label: 'Courses Available' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4',    label: 'Core Modules' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
function Home() {
  const navigate = useNavigate();
  useReveal();

  // Check if already logged in — used to personalize navbar
  const loggedIn = isLoggedIn();
  const user     = loggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  return (
    <div>
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="nav">
        <a className="nav-brand" href="/">
          <div className="nav-brand-icon">🎓</div>
          <span className="nav-brand-name">SmartCampus</span>
        </a>

        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#modules">Modules</a></li>
          <li><a href="#about">About</a></li>
        </ul>

        <div className="nav-actions">
          {loggedIn ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                👋 {user?.name?.split(' ')[0] || user?.email}
              </span>
              <button className="btn-nav-cta"
                onClick={() => navigate(isAdmin() ? '/m4/admin' : '/m4/dashboard')}>
                Go to Dashboard →
              </button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => navigate('/m4/login')}>Sign In</button>
              <button className="btn-nav-cta" onClick={() => navigate('/m4/register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Now with Google OAuth2 &amp; Role-Based Access
          </div>

          <h1>
            The Smart Way to<br />
            <span className="gradient-text">Manage Your Campus</span>
          </h1>

          <p className="hero-sub">
            A modern, secure, and beautiful campus management platform.
            Built with Spring Boot, React, and JWT — designed for students, managers, and admins.
          </p>

          <div className="hero-actions">
            {loggedIn ? (
              <button className="btn-hero-primary"
                onClick={() => navigate(isAdmin() ? '/m4/admin' : '/m4/dashboard')}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button className="btn-hero-primary" onClick={() => navigate('/m4/register')}>
                  Get Started Free →
                </button>
                <button className="btn-hero-secondary" onClick={() => navigate('/m4/login')}>
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Browser mockup */}
          <div className="hero-mockup">
            <div className="hero-mockup-card">
              <div className="mockup-bar">
                <div className="mockup-dot mockup-dot-red" />
                <div className="mockup-dot mockup-dot-amber" />
                <div className="mockup-dot mockup-dot-green" />
                <div className="mockup-url">localhost:3000/m4/dashboard</div>
              </div>
              <div className="mockup-grid">
                <div className="mockup-tile">
                  <div className="mockup-tile-icon">👤</div>
                  <div className="mockup-tile-label">Role</div>
                  <div className="mockup-tile-value">ADMIN</div>
                </div>
                <div className="mockup-tile">
                  <div className="mockup-tile-icon">🔵</div>
                  <div className="mockup-tile-label">Provider</div>
                  <div className="mockup-tile-value">Google</div>
                </div>
                <div className="mockup-tile">
                  <div className="mockup-tile-icon">⏱</div>
                  <div className="mockup-tile-label">Expires In</div>
                  <div className="mockup-tile-value">23h 59m</div>
                </div>
                <div className="mockup-tile mockup-tile-wide">
                  <div className="mockup-tile-label">Session Progress</div>
                  <div className="mockup-progress-bar">
                    <div className="mockup-progress-fill" />
                  </div>
                </div>
                <div className="mockup-tile">
                  <div className="mockup-tile-icon">🎓</div>
                  <div className="mockup-tile-label">Campus</div>
                  <div className="mockup-tile-value">Smart</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ──────────────────────────────────── */}
      <section className="stats-band">
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="stat-item-value">{s.value}</div>
              <div className="stat-item-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="reveal">
          <span className="section-label">Why SmartCampus</span>
          <h2 className="section-title">Everything you need,<br />nothing you don't</h2>
          <p className="section-sub">
            Built from the ground up with security, performance, and developer experience in mind.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="feature-card reveal"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="feature-icon"
                style={{ background: f.color, border: `1px solid ${f.border}` }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modules ─────────────────────────────────────── */}
      <section className="modules" id="modules">
        <div className="modules-inner">
          <div className="reveal">
            <span className="section-label">Platform Modules</span>
            <h2 className="section-title">Four powerful modules,<br />one unified platform</h2>
            <p className="section-sub">
              Each module is independently developed and secured with role-based access control.
            </p>
          </div>

          <div className="modules-grid">
            {MODULES.map((m, i) => (
              <div
                key={i}
                className="module-card reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
                onClick={() => navigate(m.path)}
              >
                <div className="module-card-content">
                  <div className="module-number">{m.num}</div>
                  <div className="module-icon">{m.icon}</div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <button className="module-btn">
                    Open Module →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="cta-section" id="about">
        <div className="cta-card reveal">
          <h2>Ready to get started?</h2>
          <p>
            Join SmartCampus today. Create your account in seconds —
            or sign in instantly with your Google account.
          </p>
          <div className="cta-actions">
            {loggedIn ? (
              <button className="btn-hero-primary"
                onClick={() => navigate(isAdmin() ? '/m4/admin' : '/m4/dashboard')}>
                Go to Dashboard →
              </button>
            ) : (
              <>
                <button className="btn-hero-primary" onClick={() => navigate('/m4/register')}>
                  Create Free Account →
                </button>
                <button className="btn-hero-secondary" onClick={() => navigate('/m4/login')}>
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="nav-brand-icon">🎓</div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>SmartCampus</span>
        </div>

        <p className="footer-copy">© 2026 SmartCampus. Built with Spring Boot &amp; React.</p>

        <ul className="footer-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#modules">Modules</a></li>
          <li><a href="/m4/login">Sign In</a></li>
        </ul>
      </footer>
    </div>
  );
}

export default Home;
