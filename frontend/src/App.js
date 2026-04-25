import React from 'react';
import { Routes, Route } from "react-router-dom";

import LandingPage    from './Home/LandingPage';
import Home           from './Home/Home';
import NotificationsPage from './Home/NotificationsPage';
import AdminPortal    from './Admin/AdminPortal';
import M1             from './M1/m1';
import ResourceListPage from './M1/ResourceList';
import M2             from './M2/m2';
import M3Module       from './M3/m3';
import StandaloneCreateTicketPage from './M3/pages/StandaloneCreateTicketPage';
import M4, { OAuthCallback } from './M4/m4';
import ContactPage    from './pages/ContactPage';
import FeedbackPage   from './pages/FeedbackPage';

function App() {
  return (
    <Routes>
      {/* Landing page — sign in / sign up */}
      <Route path="/" element={<LandingPage />} />

      {/* Full marketing / explore page */}
      <Route path="/home" element={<Home />} />

      {/* Unified notifications page */}
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Admin portal — redirects to /m4/admin (protected) */}
      <Route path="/admin" element={<AdminPortal />} />

      {/* M4 — Auth module (login, register, dashboard, admin) */}
      <Route path="/m4/*" element={<M4 />} />

      {/* M1 — Resource management */}
      <Route path="/m1/*" element={<M1 />} />

      {/* Public resources list + booking */}
      <Route path="/resources" element={<ResourceListPage />} />

      {/* M2 — Student portal */}
      <Route path="/m2/*" element={<M2 />} />

      {/* M3 — Ticketing module */}
      <Route path="/m3/*" element={<M3Module />} />

      {/* Standalone ticket creation */}
      <Route path="/create-ticket" element={<StandaloneCreateTicketPage />} />

      {/* Contact page */}
      <Route path="/contact" element={<ContactPage />} />

      {/* Feedback page */}
      <Route path="/feedback" element={<FeedbackPage />} />

      {/* Google OAuth2 callback */}
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;
