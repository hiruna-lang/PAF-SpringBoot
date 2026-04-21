import React from 'react';
import { Routes, Route } from "react-router-dom";

import Home          from './Home/Home';
import M1            from './M1/m1';
import M2            from './M2/m2';
import M3Module      from './M3/m3';
import M4, { OAuthCallback } from './M4/m4';

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* M1 — Campus Resource Management */}
      <Route path="/m1/*" element={<M1 />} />

      {/* M2 — Student Portal */}
      <Route path="/m2/*" element={<M2 />} />

      {/* M3 — Reports & Ticket System */}
      <Route path="/m3/*" element={<M3Module />} />

      {/* M4 — Auth module (login, register, dashboard) */}
      <Route path="/m4/*" element={<M4 />} />

      {/* Google OAuth2 callback — backend redirects here after Google login */}
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;
