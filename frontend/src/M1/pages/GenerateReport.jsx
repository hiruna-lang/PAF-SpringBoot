import React, { useEffect, useState } from "react";
import { getAllResources } from "../services/resourceApi";
import "../styles/GenerateReport.css";

const typeOptions = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const statusOptions = ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];

function GenerateReport({ setCurrentPage }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter states
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // Report data
  const [filteredResources, setFilteredResources] = useState([]);
  const [reportGenerated, setReportGenerated] = useState(false);

  useEffect(() => {
    const loadResources = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAllResources();
        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load resources.");
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, []);

  const generateReport = () => {
    let filtered = [...resources];

    // Filter by type
    if (selectedType !== "ALL") {
      filtered = filtered.filter((r) => r.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((r) => r.status === selectedStatus);
    }

    // Filter by date range (if applicable)
    if (dateFrom || dateTo) {
      filtered = filtered.filter((r) => {
        const resourceDate = new Date(r.createdAt);
        if (dateFrom && resourceDate < new Date(dateFrom)) return false;
        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59);
          if (resourceDate > endDate) return false;
        }
        return true;
      });
    }

    setFilteredResources(filtered);
    setReportGenerated(true);
  };

  const getReportStats = () => {
    const total = filteredResources.length;
    const active = filteredResources.filter((r) => r.status === "ACTIVE").length;
    const outOfService = filteredResources.filter((r) => r.status === "OUT_OF_SERVICE").length;
    const maintenance = filteredResources.filter((r) => r.status === "MAINTENANCE").length;
    
    const byType = typeOptions.map((type) => ({
      type,
      count: filteredResources.filter((r) => r.type === type).length,
    }));

    return { total, active, outOfService, maintenance, byType };
  };

  const exportAsCSV = () => {
    const stats = getReportStats();
    let csvContent = "Campus Resource Management Report\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `\n--- SUMMARY ---\n`;
    csvContent += `Total Resources,${stats.total}\n`;
    csvContent += `Active,${stats.active}\n`;
    csvContent += `Out of Service,${stats.outOfService}\n`;
    csvContent += `Maintenance,${stats.maintenance}\n`;
    csvContent += `\n--- BY TYPE ---\n`;
    csvContent += `Type,Count\n`;
    stats.byType.forEach((item) => {
      csvContent += `${item.type},${item.count}\n`;
    });
    csvContent += `\n--- DETAILED RESOURCES ---\n`;
    csvContent += "ID,Name,Type,Status,Location,Capacity\n";
    filteredResources.forEach((resource) => {
      csvContent += `${resource.id},"${resource.name}","${resource.type}","${resource.status}","${resource.location || 'N/A'}",${resource.capacity || 'N/A'}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `resource-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAsPDF = () => {
    const stats = getReportStats();
    const printWindow = window.open("", "", "height=600,width=800");
    const htmlContent = `
      <html>
        <head>
          <title>Campus Resource Management Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; }
            h2 { color: #047857; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .summary { background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin-top: 10px; }
            .stat { display: inline-block; margin-right: 30px; }
            .stat-label { font-weight: bold; color: #059669; }
            .stat-value { font-size: 24px; color: #059669; }
            .timestamp { color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Campus Resource Management Report</h1>
          <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
          
          <div class="summary">
            <h2>Summary</h2>
            <div class="stat">
              <div class="stat-label">Total Resources</div>
              <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Active</div>
              <div class="stat-value">${stats.active}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Out of Service</div>
              <div class="stat-value">${stats.outOfService}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Maintenance</div>
              <div class="stat-value">${stats.maintenance}</div>
            </div>
          </div>

          <h2>Resources by Type</h2>
          <table>
            <tr>
              <th>Type</th>
              <th>Count</th>
            </tr>
            ${stats.byType.map((item) => `
              <tr>
                <td>${item.type}</td>
                <td>${item.count}</td>
              </tr>
            `).join('')}
          </table>

          <h2>Detailed Resources</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Location</th>
              <th>Capacity</th>
            </tr>
            ${filteredResources.map((resource) => `
              <tr>
                <td>${resource.id}</td>
                <td>${resource.name}</td>
                <td>${resource.type}</td>
                <td>${resource.status}</td>
                <td>${resource.location || 'N/A'}</td>
                <td>${resource.capacity || 'N/A'}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const resetFilters = () => {
    setSelectedType("ALL");
    setSelectedStatus("ALL");
    setDateFrom("");
    setDateTo("");
    setReportGenerated(false);
    setFilteredResources([]);
  };

  const stats = reportGenerated ? getReportStats() : null;

  return (
    <div className="m1-page m1-report-shell">
      <section className="m1-report-hero m1-card-lg">
        <div>
          <p className="m1-hero-badge">
            <span className="m1-hero-badge-dot" />
            Report Generator
          </p>
          <h2 className="m1-page-title">Generate Report</h2>
          <p className="m1-page-sub">Create customized resource management reports.</p>
        </div>
      </section>

      {error && <div className="m1-alert error">{error}</div>}

      {/* Filters Section */}
      <section className="m1-report-filters m1-card-lg">
        <h3 className="m1-section-title">Report Filters</h3>
        
        <div className="m1-filter-grid">
          {/* Type Filter */}
          <div className="m1-filter-group">
            <label htmlFor="typeFilter" className="m1-filter-label">
              Resource Type
            </label>
            <select
              id="typeFilter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="m1-filter-select"
            >
              <option value="ALL">All Types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="m1-filter-group">
            <label htmlFor="statusFilter" className="m1-filter-label">
              Status
            </label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="m1-filter-select"
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="m1-filter-group">
            <label htmlFor="dateFrom" className="m1-filter-label">
              From Date
            </label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="m1-filter-input"
            />
          </div>

          {/* Date To */}
          <div className="m1-filter-group">
            <label htmlFor="dateTo" className="m1-filter-label">
              To Date
            </label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="m1-filter-input"
            />
          </div>
        </div>

        <div className="m1-filter-actions">
          <button
            className="m1-btn-primary"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
          <button
            className="m1-btn-secondary"
            onClick={resetFilters}
            disabled={!reportGenerated}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* Report Results */}
      {reportGenerated && stats && (
        <>
          {/* Summary Stats */}
          <section className="m1-report-summary">
            <h3 className="m1-section-title">Summary</h3>
            <div className="m1-stats-grid m1-report-stats">
              <div className="m1-card m1-report-stat-card" style={{ "--m1-delay": "0ms" }}>
                <p className="m1-stat-label">Total Resources</p>
                <p className="m1-stat-value">{stats.total}</p>
              </div>
              <div className="m1-card m1-report-stat-card" style={{ "--m1-delay": "70ms" }}>
                <p className="m1-stat-label">Active</p>
                <p className="m1-stat-value emerald">{stats.active}</p>
              </div>
              <div className="m1-card m1-report-stat-card" style={{ "--m1-delay": "140ms" }}>
                <p className="m1-stat-label">Out of Service</p>
                <p className="m1-stat-value amber">{stats.outOfService}</p>
              </div>
              <div className="m1-card m1-report-stat-card" style={{ "--m1-delay": "210ms" }}>
                <p className="m1-stat-label">Maintenance</p>
                <p className="m1-stat-value blue">{stats.maintenance}</p>
              </div>
            </div>
          </section>

          {/* By Type */}
          <section className="m1-report-bytype">
            <h3 className="m1-section-title">Resources by Type</h3>
            <div className="m1-type-grid m1-report-grid">
              {stats.byType.map((item, index) => (
                <div
                  key={item.type}
                  className="m1-card m1-report-type-card"
                  style={{ "--m1-delay": `${index * 70}ms` }}
                >
                  <p className="m1-type-label">{item.type.replace(/_/g, " ")}</p>
                  <p className="m1-type-count">{item.count}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Resources Table */}
          <section className="m1-report-table">
            <h3 className="m1-section-title">Detailed Resources ({filteredResources.length})</h3>
            <div className="m1-table-container">
              {filteredResources.length > 0 ? (
                <table className="m1-data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map((resource) => (
                      <tr key={resource.id}>
                        <td>{resource.id}</td>
                        <td>{resource.name}</td>
                        <td>{resource.type.replace(/_/g, " ")}</td>
                        <td>
                          <span className={`m1-status-badge status-${resource.status.toLowerCase().replace(/_/g, "-")}`}>
                            {resource.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td>{resource.location || "N/A"}</td>
                        <td>{resource.capacity || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="m1-no-data">No resources match the selected filters.</p>
              )}
            </div>
          </section>

          {/* Export Options */}
          <section className="m1-report-exports">
            <h3 className="m1-section-title">Export Report</h3>
            <div className="m1-export-actions">
              <button
                className="m1-btn-export m1-btn-export-csv"
                onClick={exportAsCSV}
              >
                📊 Export as CSV
              </button>
              <button
                className="m1-btn-export m1-btn-export-pdf"
                onClick={exportAsPDF}
              >
                📄 Print / Export as PDF
              </button>
            </div>
          </section>
        </>
      )}

      {reportGenerated && stats && stats.total === 0 && (
        <div className="m1-alert info">
          No resources found matching the selected filters. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}

export default GenerateReport;
