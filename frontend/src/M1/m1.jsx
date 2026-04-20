import React, { useState } from "react";
import ResourceDashboard from "./pages/ResourceDashboard";
import ViewResources from "./pages/ViewResources";
import CreateResource from "./pages/CreateResource";
import UpdateResource from "./pages/UpdateResource";
import ResourceDetails from "./pages/ResourceDetails";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white/90 px-6 py-6 shadow-sm backdrop-blur lg:w-72 lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Module 1
            </p>
            <h1 className="text-xl font-semibold text-slate-900">
              Campus Resource Management
            </h1>
            <p className="text-xs text-slate-500">
              Operational hub for campus facilities.
            </p>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  currentPage === item.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{item.label}</span>
                {currentPage === item.key && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
                    Active
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
            Frontend running on port 5000 with local API connectivity.
          </div>
        </aside>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-6xl space-y-6">{renderPage()}</div>
        </main>
      </div>
    </div>
  );
}

export default M1;
