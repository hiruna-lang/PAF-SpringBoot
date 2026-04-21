import React, { useState } from "react";
import ResourceDashboard from "./pages/ResourceDashboard";
import ViewResources from "./pages/ViewResources";
import CreateResource from "./pages/CreateResource";
import UpdateResource from "./pages/UpdateResource";
import ResourceDetails from "./pages/ResourceDetails";
import "./m1.css";

const navItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "view", label: "View Resources" },
  { key: "create", label: "Create Resource" },
  { key: "update", label: "Update Resource" },
];

function M1() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedResource, setSelectedResource] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case "view":
        return (
          <ViewResources
            setCurrentPage={setCurrentPage}
            setSelectedResource={setSelectedResource}
          />
        );
      case "create":
        return <CreateResource setCurrentPage={setCurrentPage} />;
      case "update":
        return (
          <UpdateResource
            setCurrentPage={setCurrentPage}
            selectedResource={selectedResource}
          />
        );
      case "details":
        return (
          <ResourceDetails
            resource={selectedResource}
            setCurrentPage={setCurrentPage}
          />
        );
      case "dashboard":
      default:
        return <ResourceDashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="m1-root">
      <div className="m1-layout">
        <aside className="m1-sidebar">
          <div>
            <p className="m1-sidebar-label">Module 1</p>
            <h1 className="m1-sidebar-title">Campus Resource Management</h1>
            <p className="m1-sidebar-sub">Operational hub for campus facilities.</p>
          </div>
          <nav className="m1-nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`m1-nav-btn${currentPage === item.key ? " active" : ""}`}
              >
                <span>{item.label}</span>
                {currentPage === item.key && (
                  <span className="m1-nav-badge">Active</span>
                )}
              </button>
            ))}
          </nav>
          <div className="m1-sidebar-info">
            Frontend running on port 3000 with local API connectivity.
          </div>
        </aside>

        <main className="m1-main">
          <div className="m1-content">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}

export default M1;
