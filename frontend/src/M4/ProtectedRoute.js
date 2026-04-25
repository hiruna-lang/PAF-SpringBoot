import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getRole } from "./authService";

/**
 * ProtectedRoute
 *
 * Props:
 *   children  — component to render when access is granted
 *   roles     — optional array of allowed roles, e.g. ["ADMIN"]
 *               omit to allow any authenticated user
 *
 * Rules:
 *   1. Not logged in                    → /m4/login
 *   2. Non-admin trying /m4/admin path  → /m4/dashboard
 *   3. Role-restricted route mismatch   → /m4/dashboard (or /m4/admin for admins)
 */
function ProtectedRoute({ children, roles }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/m4/login" state={{ from: location }} replace />;
  }

  const role = getRole();

  // Hard block: only ADMIN can access /m4/admin
  if (location.pathname.startsWith("/m4/admin") && role !== "ADMIN") {
    return <Navigate to="/m4/dashboard" replace />;
  }

  // Role-restricted route check
  if (roles && !roles.includes(role)) {
    if (role === "ADMIN") return <Navigate to="/m4/admin" replace />;
    return <Navigate to="/m4/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
