import { Outlet } from "react-router-dom";
import { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTickets } from "../context/TicketContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function ModuleLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isBootstrapping, lastError } = useTickets();

  return (
    <div className="m3-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="m3-main">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="m3-content">
          {lastError && !isBootstrapping ? (
            <section className="m3-alert-card m3-alert-card--danger">
              <h3>Backend Sync Error</h3>
              <p>{lastError}</p>
            </section>
          ) : null}
          {isBootstrapping ? <LoadingSpinner label="Syncing operational workspace" /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
