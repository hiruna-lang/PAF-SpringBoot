import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoutIcon, MenuIcon } from "../components/Icons";
import { getRoleBasePath } from "../routes";

function getPageTitle(pathname) {
  if (pathname.includes("/create")) {
    return "Create Ticket";
  }
  if (pathname.includes("/admin")) {
    return "Admin Panel";
  }
  if (pathname.includes("/tickets/")) {
    return "Ticket Details";
  }
  if (pathname.includes("/tickets")) {
    return "Tickets";
  }
  return "Dashboard";
}

export default function Topbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, availableRoles, switchRole, logout } = useAuth();

  return (
    <header className="m3-topbar">
      <div className="m3-topbar__title">
        <button type="button" className="m3-icon-button m3-mobile-only" onClick={onMenuToggle}>
          <MenuIcon />
        </button>
        <div>
          <span className="m3-eyebrow">Maintenance and Incident Ticketing</span>
          <h1>{getPageTitle(location.pathname)}</h1>
        </div>
      </div>

      <div className="m3-topbar__actions">
        <div className="m3-profile-pill">
          <div>
            <strong>{user?.name}</strong>
            <span>{role}</span>
          </div>
        </div>

        <label className="m3-role-switch">
          <span>Role</span>
          <select
            value={role}
            onChange={(event) => {
              const nextRole = event.target.value;
              switchRole(nextRole);
              navigate(getRoleBasePath(nextRole));
            }}
          >
            {availableRoles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="m3-icon-button"
          onClick={() => {
            logout();
            navigate("/m3/access");
          }}
        >
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
