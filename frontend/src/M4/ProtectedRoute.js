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
 *   1. Not logged in          → /m4/login
 *   2. Logged in, wrong role  → redirect to the user's own home
 *      - ADMIN      → /m4/admin
 *      - TECHNICIAN → /m3
 *      - USER       → /m4/dashboard
 *   3. USER or TECHNICIAN trying to reach any /m4/admin path → /m4/dashboard
 */
function ProtectedRoute({ children, roles }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/m4/login" state={{ from: location }} replace />;
  }

  const role = getRole();

  // Hard block: non-admins must never reach anything under /m4/admin
  const isAdminPath = location.pathname.startsWith("/m4/admin");
  if (isAdminPath && role !== "ADMIN") {
    if (role === "TECHNICIAN") return <Navigate to="/m3" replace />;
    return <Navigate to="/m4/dashboard" replace />;
  }

  // Role-restricted route check
  if (roles && !roles.includes(role)) {
    if (role === "ADMIN")      return <Navigate to="/m4/admin"     replace />;
    if (role === "TECHNICIAN") return <Navigate to="/m3"           replace />;
    return                            <Navigate to="/m4/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
