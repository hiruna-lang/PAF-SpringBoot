import React from 'react';
import { Routes, Route } from "react-router-dom";

import Home          from './Home/Home';
import NotificationsPage from './Home/NotificationsPage';
import AdminPortal from './Admin/AdminPortal';
import M1 from './M1/m1';
import ResourceListPage from './M1/ResourceList';
import M2 from './M2/m2';
import M3Module from './M3/m3';
import StandaloneCreateTicketPage from './M3/pages/StandaloneCreateTicketPage';
import M4, { OAuthCallback } from './M4/m4';

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Unified notifications page */}
      <Route path="/notifications" element={<NotificationsPage />} />

      {/* Admin portal */}
      <Route path="/admin" element={<AdminPortal />} />

      {/* M4 — Auth module (login, register, dashboard) */}
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

      {/* Google OAuth2 callback — backend redirects here after Google login */}
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;
