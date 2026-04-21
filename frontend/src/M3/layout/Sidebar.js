import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AddIcon, DashboardIcon, ShieldIcon, TicketIcon } from "../components/Icons";
import { buildRolePath, getRoleBasePath } from "../routes";

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const basePath = getRoleBasePath(role);

  const items = [
    { label: "Dashboard", to: basePath, icon: <DashboardIcon /> },
    { label: "Tickets", to: buildRolePath(role, "tickets"), icon: <TicketIcon /> },
    ...(role !== "TECHNICIAN" ? [{ label: "Create Ticket", to: buildRolePath(role, "create"), icon: <AddIcon /> }] : []),
    ...(role === "ADMIN" ? [{ label: "Admin Panel", to: buildRolePath(role, "admin"), icon: <ShieldIcon /> }] : []),
  ];

  return (
    <>
      <aside className={`m3-sidebar ${open ? "is-open" : ""}`}>
        <div className="m3-sidebar__brand">
          <span>Smart Campus</span>
          <strong>Operations Hub</strong>
        </div>
        <nav className="m3-sidebar__nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === basePath} className="m3-nav-link" onClick={onClose}>
              <span className="m3-nav-link__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="m3-sidebar__footer">
          <span className="m3-eyebrow">Role Scope</span>
          <strong>{role}</strong>
          <p>Maintenance and incident workflows adapt to the signed-in role.</p>
        </div>
      </aside>
      {open ? <button type="button" className="m3-sidebar-backdrop" onClick={onClose} /> : null}
    </>
  );
}
