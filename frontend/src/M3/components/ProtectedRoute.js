import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleBasePath, getRoleFromSegment } from "../routes";

export default function ProtectedRoute({ allowedRoles }) {
  const { auth } = useAuth();
  const { roleSegment } = useParams();

  if (!auth?.token) {
    return <Navigate to="/m3/access" replace />;
  }

  const routeRole = getRoleFromSegment(roleSegment);
  if (roleSegment && routeRole !== auth.role) {
    return <Navigate to={getRoleBasePath(auth.role)} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to={getRoleBasePath(auth.role)} replace />;
  }

  return <Outlet />;
}
