import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "./authService";

/**
 * ProtectedRoute
 * Props:
 *   children   — the component to render
 *   roles      — array of allowed roles e.g. ["ADMIN"] or ["ADMIN","MANAGER"]
 *                omit to allow any authenticated user
 */
function ProtectedRoute({ children, roles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/m4/login" replace />;
  }

  if (roles && !roles.includes(getRole())) {
    // Logged in but wrong role → send to their dashboard
    return <Navigate to="/m4/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
