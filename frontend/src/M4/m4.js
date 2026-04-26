import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login          from "./Login";
import Register       from "./Register";
import OAuthCallback  from "./OAuthCallback";
import Dashboard      from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import ProfilePage    from "./ProfilePage";
import ProtectedRoute from "./ProtectedRoute";

function M4() {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />
      <Route path="login"    element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Standalone user profile page — no sidebar */}
      <Route path="profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Dashboard — admin gets sidebar, user/technician gets top-nav */}
      <Route path="dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* ADMIN only */}
      <Route path="admin" element={
        <ProtectedRoute roles={["ADMIN"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default M4;
export { OAuthCallback };
