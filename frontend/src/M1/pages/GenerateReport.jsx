import React, { useEffect, useState } from "react";
import { getAllResources } from "../services/resourceApi";
import "../styles/GenerateReport.css";

const TYPE_OPTIONS   = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const STATUS_OPTIONS = ["ACTIVE", "OUT_OF_SERVICE", "MAINTENANCE"];
const fmt = (s) => s?.replace(/_/g, " ") ?? s;

export default function GenerateReport({ setCurrentPage }) {
  const [resources,         setResources]         = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [error,             setError]             = useState("");
  const [selectedType,      setSelectedType]      = useState("ALL");
  const [selectedStatus,    setSelectedStatus]    = useState("ALL");
  const [dateFrom,          setDateFrom]          = useState("");
  const [dateTo,            setDateTo]            = useState("");
  const [filteredResources, setFilteredResources] = useState([]);
  const [reportGenerated,   setReportGenerated]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getAllResources();
        setResources(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Failed to load resources.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generateReport = () => {
    let filtered = [...resources];
    if (selectedType   !== "ALL") filtered = filtered.filter(r => r.type   === selectedType);
    if (selectedStatus !== "ALL") filtered = filtered.filter(r => r.status === selectedStatus);
    if (dateFrom || dateTo) {
      filtered = filtered.filter(r => {
        const d = new Date(r.createdAt);
        if (dateFrom && d < new Date(dateFrom)) return false;
        if (dateTo) { const e = new Date(dateTo); e.setHours(23,59,59); if (d > e) return false; }
        return true;
      });
    }
    setFilteredResources(filtered);
    setReportGenerated(true);
  };

  const reset = () => {
    setSelectedType("ALL"); setSelectedStatus("ALL");
    setDateFrom(""); setDateTo("");
    setReportGenerated(false); setFilteredResources([]);
  };

  const stats = reportGenerated ? {
    total:      filteredResources.length,
    active:     filteredResources.filter(r => r.status === "ACTIVE").length,
    outOfSvc:   filteredResources.filter(r => r.status === "OUT_OF_SERVICE").length,
    maintenance:filteredResources.filter(r => r.status === "MAINTENANCE").length,
    byType:     TYPE_OPTIONS.map(t => ({ type: t, count: filteredResources.filter(r => r.type === t).length })),
  } : null;

  const exportCSV = () => {
    let csv = "Campus Resource Management Report\n";
    csv += `Generated: ${new Date().toLocaleString()}\n\n--- SUMMARY ---\n`;
    csv += `Total,${stats.total}\nActive,${stats.active}\nOut of Service,${stats.outOfSvc}\nMaintenance,${stats.maintenance}\n`;
    csv += `\n--- BY TYPE ---\nType,Count\n`;
    stats.byType.forEach(i => { csv += `${i.type},${i.count}\n`; });
    csv += `\n--- RESOURCES ---\nID,Name,Type,Status,Location,Capacity\n`;
    filteredResources.forEach(r => {
      csv += `${r.id},"${r.name}","${r.type}","${r.status}","${r.location||'N/A'}",${r.capacity||'N/A'}\n`;
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    a.download = `resource-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const w = window.open("", "", "height=700,width=900");
    w.document.write(`<html><head><title>Resource Report</title>
      <style>
        body{font-family:Arial,sans-serif;margin:24px;color:#1e293b}
        h1{color:#0d9488;border-bottom:3px solid #0d9488;padding-bottom:8px}
        h2{color:#0f766e;margin-top:24px}
        table{width:100%;border-collapse:collapse;margin-top:10px}
        th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left}
        th{background:#f0fdfa;font-weight:700;color:#0f766e}
        .summary{display:flex;gap:32px;background:#f0fdfa;padding:16px;border-radius:8px;margin-top:12px}
        .stat{text-align:center}.stat-label{font-size:12px;color:#64748b;font-weight:600}
        .stat-value{font-size:28px;font-weight:800;color:#0d9488}
        .ts{color:#94a3b8;font-size:12px;margin-top:4px}
        .badge-active{color:#16a34a}.badge-out{color:#e11d48}.badge-maint{color:#d97706}
      </style></head><body>
      <h1>Campus Resource Management Report</h1>
      <p class="ts">Generated: ${new Date().toLocaleString()}</p>
      <h2>Summary</h2>
      <div class="summary">
        <div class="stat"><div class="stat-label">Total</div><div class="stat-value">${stats.total}</div></div>
        <div class="stat"><div class="stat-label">Active</div><div class="stat-value" style="color:#16a34a">${stats.active}</div></div>
        <div class="stat"><div class="stat-label">Out of Service</div><div class="stat-value" style="color:#e11d48">${stats.outOfSvc}</div></div>
        <div class="stat"><div class="stat-label">Maintenance</div><div class="stat-value" style="color:#d97706">${stats.maintenance}</div></div>
      </div>
      <h2>By Type</h2>
      <table><tr><th>Type</th><th>Count</th></tr>
        ${stats.byType.map(i => `<tr><td>${fmt(i.type)}</td><td>${i.count}</td></tr>`).join("")}
      </table>
      <h2>Resources (${filteredResources.length})</h2>
      <table><tr><th>Name</th><th>Type</th><th>Status</th><th>Location</th><th>Capacity</th></tr>
        ${filteredResources.map(r => `<tr>
          <td><strong>${r.name}</strong></td>
          <td>${fmt(r.type)}</td>
          <td class="badge-${r.status==="ACTIVE"?"active":r.status==="OUT_OF_SERVICE"?"out":"maint"}">${fmt(r.status)}</td>
          <td>${r.location||"N/A"}</td><td>${r.capacity||"N/A"}</td>
        </tr>`).join("")}
      </table>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  /* ── Styles ── */
  const card = {
    background: "#fff", borderRadius: 14, padding: "20px 24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  };
  const label = { fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 5, display: "block" };
  const input = {
    width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0",
    borderRadius: 8, fontSize: 13, outline: "none", background: "#fff",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 32 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#0d9488" }}>
            Resource Manager
          </p>
          <h2 style={{ margin: "4px 0 4px", fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Generate Report</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Filter resources and export a summarised report as CSV or PDF
          </p>
        </div>
        <button onClick={() => setCurrentPage("dashboard")} style={{
          background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 8,
          padding: "8px 16px", fontSize: 12, fontWeight: 600, color: "#0d9488", cursor: "pointer",
        }}>
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 16px", color: "#b91c1c", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Filters ── */}
      <div style={card}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Report Filters</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          <div>
            <span style={label}>Resource Type</span>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={input}>
              <option value="ALL">All Types</option>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{fmt(t)}</option>)}
            </select>
          </div>
          <div>
            <span style={label}>Status</span>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={input}>
              <option value="ALL">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{fmt(s)}</option>)}
            </select>
          </div>
          <div>
            <span style={label}>From Date</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={input} />
          </div>
          <div>
            <span style={label}>To Date</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={input} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={generateReport} disabled={loading} style={{
            background: "#0d9488", color: "#fff", border: "none",
            borderRadius: 8, padding: "9px 20px", fontWeight: 700,
            fontSize: 13, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(13,148,136,0.3)",
          }}>
            {loading ? "Loading…" : "Generate Report"}
          </button>
          {reportGenerated && (
            <button onClick={reset} style={{
              background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0",
              borderRadius: 8, padding: "9px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      {reportGenerated && stats && (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
            {[
              { label: "Total",        value: stats.total,       color: "#0d9488" },
              { label: "Active",       value: stats.active,      color: "#16a34a" },
              { label: "Out of Svc",   value: stats.outOfSvc,    color: "#e11d48" },
              { label: "Maintenance",  value: stats.maintenance, color: "#d97706" },
            ].map(s => (
              <div key={s.label} style={{ ...card, borderTop: `4px solid ${s.color}`, padding: "14px 18px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* By type */}
          <div style={card}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>By Type</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
              {stats.byType.map(i => (
                <div key={i.type} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>{fmt(i.type)}</p>
                  <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0d9488" }}>{i.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={card}>
            <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
              Resources ({filteredResources.length})
            </h3>
            {filteredResources.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Name", "Type", "Status", "Location", "Capacity"].map(h => (
                        <th key={h} style={{
                          padding: "9px 14px", textAlign: "left",
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.06em", color: "#64748b",
                          borderBottom: "2px solid #e2e8f0",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResources.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0f172a" }}>{r.name}</td>
                        <td style={{ padding: "10px 14px", color: "#475569" }}>{fmt(r.type)}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                            background: r.status === "ACTIVE" ? "#f0fdf4" : r.status === "OUT_OF_SERVICE" ? "#fef2f2" : "#fffbeb",
                            color:      r.status === "ACTIVE" ? "#16a34a" : r.status === "OUT_OF_SERVICE" ? "#e11d48" : "#d97706",
                          }}>{fmt(r.status)}</span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#475569" }}>{r.location || "N/A"}</td>
                        <td style={{ padding: "10px 14px", color: "#475569" }}>{r.capacity || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                No resources match the selected filters.
              </p>
            )}
          </div>

          {/* Export */}
          <div style={{ ...card, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Export report:</span>
            <button onClick={exportCSV} style={{
              background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
              borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
              📊 Export CSV
            </button>
            <button onClick={exportPDF} style={{
              background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe",
              borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>
              📄 Print / PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
