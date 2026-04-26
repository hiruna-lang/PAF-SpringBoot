import { Navigate, Route, Routes } from "react-router-dom";
import "./M3.css";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { TicketProvider } from "./context/TicketContext";
import { ToastProvider } from "./context/ToastContext";
import ModuleLayout from "./layout/ModuleLayout";
import AccessGatePage from "./pages/AccessGatePage";
import AdminPanelPage from "./pages/AdminPanelPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import DashboardPage from "./pages/DashboardPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import { useAuth } from "./context/AuthContext";
import { getRoleBasePath } from "./routes";

function RoleLandingRedirect() {
  const { role, isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? getRoleBasePath(role) : "/m3/access"} replace />;
}

export default function M3Module() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TicketProvider>
          <Routes>
            <Route index element={<RoleLandingRedirect />} />
            <Route path="access" element={<AccessGatePage />} />

            <Route path=":roleSegment" element={<ProtectedRoute />}>
              <Route element={<ModuleLayout />}>
                <Route index element={<DashboardPage />} />
                <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN", "TECHNICIAN"]} />}>
                  <Route path="create" element={<CreateTicketPage />} />
                </Route>
                <Route path="tickets" element={<MyTicketsPage />} />
                <Route path="tickets/:ticketId" element={<TicketDetailsPage />} />
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                  <Route path="admin" element={<AdminPanelPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/m3" replace />} />
          </Routes>
        </TicketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
