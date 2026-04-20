import React from 'react';
import { Routes, Route } from "react-router-dom";

import Home          from './Home/Home';
import M4, { OAuthCallback } from './M4/m4';

function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* M4 — Auth module (login, register, dashboard) */}
      <Route path="/m4/*" element={<M4 />} />

      {/* Google OAuth2 callback — backend redirects here after Google login */}
      <Route path="/oauth2/callback" element={<OAuthCallback />} />
    </Routes>
  );
}

export default App;
