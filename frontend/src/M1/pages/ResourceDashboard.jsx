import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { getAllResources } from "../services/resourceApi";
import { fetchAnalytics, fetchAllBookings } from "../../M2/bookingService";

/* ── Palette ─────────────────────────────────────────────── */
const C = {
  teal:   "#0d9488",
  green:  "#16a34a",
  blue:   "#2563eb",
  amber:  "#d97706",
  rose:   "#e11d48",
  sky:    "#0284c7",
  violet: "#7c3aed",
  slate:  "#64748b",
};
const PIE_COLORS     = [C.teal, C.blue, C.green, C.amber, C.violet, C.sky];
const STATUS_COLORS  = { PENDING: C.amber, APPROVED: C.green, REJECTED: C.rose, CANCELLED: C.slate };
const TYPE_OPTIONS   = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

/* ── Shared tooltip ─────────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#1e293b" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color || C.teal }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── Card shells ─────────────────────────────────────────── */
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "18px 20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      borderTop: `4px solid ${color}`,
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.slate }}>
          {label}
        </span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</span>}
    </div>
  );
}

function ChartCard({ title, children, height = 260 }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "18px 20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{title}</h3>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
const fmt = (s) => s?.replace(/_/g, " ") ?? s;

function deriveMonthlyTrend(bookings) {
  const counts = {};
  bookings.forEach(b => {
    if (!b.createdAt) return;
    const d = new Date(b.createdAt);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    counts[key] = (counts[key] || 0) + 1;
  });
  // Return last 6 months in order
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
    months.push({ month: d.toLocaleString("en-US", { month: "short" }), bookings: counts[key] || 0 });
  }
  return months;
}

function derivePeakHours(bookings) {
  const counts = {};
  bookings.forEach(b => {
    if (!b.startTime) return;
    // startTime is "HH:MM:SS" or "HH:MM"
    const hour = String(b.startTime).substring(0, 5);
    counts[hour] = (counts[hour] || 0) + 1;
  });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, bookings]) => ({ hour, bookings }));
}

/* ── Main component ─────────────────────────────────────── */
export default function ResourceDashboard({ setCurrentPage }) {
  const [resources,    setResources]    = useState([]);
  const [analytics,    setAnalytics]    = useState(null);
  const [allBookings,  setAllBookings]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [lastUpdated,  setLastUpdated]  = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [resData, analyticsData, bookingsData] = await Promise.all([
        getAllResources(),
        fetchAnalytics().catch(() => null),
        fetchAllBookings().catch(() => []),
      ]);
      setResources(Array.isArray(resData) ? resData : []);
      setAnalytics(analyticsData);
      setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 30000);
    return () => clearInterval(id);
  }, []);

  /* ── Derived from real data ── */
  const stats = useMemo(() => {
    const total      = resources.length;
    const active     = resources.filter(r => r.status === "ACTIVE").length;
    const outOfSvc   = resources.filter(r => r.status === "OUT_OF_SERVICE").length;
    const maintenance= resources.filter(r => r.status === "MAINTENANCE").length;

    // Pie: resource type distribution
    const byType = TYPE_OPTIONS
      .map(t => ({ name: fmt(t), value: resources.filter(r => r.type === t).length }))
      .filter(d => d.value > 0);

    // Booking status from analytics.statusBreakdown
    const statusBreakdown = analytics?.statusBreakdown
      ? Object.entries(analytics.statusBreakdown).map(([status, count]) => ({ status, count: Number(count) }))
      : [];

    // Top resources from analytics
    const topResources = analytics?.topResources || [];

    // Most booked bar chart — from topResources
    const mostBooked = topResources
      .slice(0, 6)
      .map(r => ({ name: r.resourceName, bookings: Number(r.bookingCount) }));

    // Monthly trend from real bookings
    const monthlyTrend = deriveMonthlyTrend(allBookings);

    // Peak hours from real bookings
    const peakHours = derivePeakHours(allBookings);

    // Top 5 table — enrich topResources with resource type
    const resourceMap = {};
    resources.forEach(r => { resourceMap[r.id] = r; });
    const top5 = topResources.slice(0, 5).map(r => {
      const res = resourceMap[r.resourceId];
      const total = analytics?.totalBookings || 1;
      const pct = Math.round((Number(r.bookingCount) / total) * 100);
      return {
        name:     r.resourceName,
        type:     res ? fmt(res.type) : "—",
        bookings: Number(r.bookingCount),
        pct:      Math.min(pct, 100),
      };
    });

    return {
      total, active, outOfSvc, maintenance,
      byType, statusBreakdown, mostBooked,
      monthlyTrend, peakHours, top5,
      totalBookings: analytics?.totalBookings ?? 0,
    };
  }, [resources, analytics, allBookings]);

  const val = (v) => loading ? "…" : v;

  const grid4 = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 };
  const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: 18 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 32 }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f766e 0%, #0d5c56 60%, #065f46 100%)",
        borderRadius: 16, padding: "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, color: "#fff",
      }}>
        <div>
          <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6ee7b7" }}>
            Campus Resource Center
          </p>
          <h2 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800 }}>Dashboard</h2>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Live snapshot of campus resources and booking analytics
            {lastUpdated && (
              <span style={{ marginLeft: 10, opacity: 0.6 }}>
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setCurrentPage("create")} style={{
            background: "#16a34a", color: "#fff", border: "none",
            borderRadius: 9, padding: "9px 18px", fontWeight: 700,
            fontSize: 13, cursor: "pointer",
            boxShadow: "0 3px 10px rgba(22,163,74,0.4)",
          }}>+ Create Resource</button>
          <button onClick={() => setCurrentPage("view")} style={{
            background: "rgba(255,255,255,0.15)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 9, padding: "9px 18px", fontWeight: 600,
            fontSize: 13, cursor: "pointer",
          }}>View Resources</button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 16px", color: "#b91c1c", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Summary cards ── */}
      <div style={grid4}>
        <StatCard label="Total Resources" value={val(stats.total)}         color={C.teal}  icon="🏢" sub="All registered" />
        <StatCard label="Active"          value={val(stats.active)}        color={C.green} icon="✅" sub="Ready to book" />
        <StatCard label="Out of Service"  value={val(stats.outOfSvc)}      color={C.rose}  icon="🚫" sub="Unavailable" />
        <StatCard label="Total Bookings"  value={val(stats.totalBookings)} color={C.blue}  icon="📅" sub="All-time" />
      </div>

      {/* ── Row 1: Type pie + Most booked bar ── */}
      <div style={grid2}>
        <ChartCard title="Resource Distribution by Type">
          {stats.byType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byType} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={95}
                  paddingAngle={3} dataKey="value">
                  {stats.byType.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTip />} />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>
              {loading ? "Loading…" : "No resource data"}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Most Booked Resources">
          {stats.mostBooked.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.mostBooked}
                margin={{ top: 4, right: 8, left: -14, bottom: 44 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="bookings" fill={C.teal} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>
              {loading ? "Loading…" : "No booking data yet"}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Status summary + Trend ── */}
      <div style={grid2}>
        <ChartCard title="Booking Status Summary">
          {stats.statusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusBreakdown}
                margin={{ top: 4, right: 8, left: -14, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {stats.statusBreakdown.map((d, i) => (
                    <Cell key={i} fill={STATUS_COLORS[d.status] || C.teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>
              {loading ? "Loading…" : "No booking data yet"}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Booking Trend — Last 6 Months">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyTrend}
              margin={{ top: 4, right: 16, left: -14, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="bookings"
                stroke={C.teal} strokeWidth={2.5}
                dot={{ r: 5, fill: C.teal, strokeWidth: 0 }}
                activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Peak Hours ── */}
      <ChartCard title="Peak Booking Hours" height={220}>
        {stats.peakHours.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.peakHours}
              margin={{ top: 4, right: 16, left: -14, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="bookings" fill={C.sky} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8", fontSize: 13 }}>
            {loading ? "Loading…" : "No booking data yet"}
          </div>
        )}
      </ChartCard>

      {/* ── Top 5 Table ── */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: "18px 20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
          Top 5 Most Used Resources
        </h3>
        {stats.top5.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["#", "Resource", "Type", "Bookings", "Share"].map(h => (
                    <th key={h} style={{
                      padding: "9px 14px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.06em", color: C.slate,
                      borderBottom: "2px solid #e2e8f0",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.top5.map((r, i) => (
                  <tr key={i}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0f172a" }}>{r.name}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        background: "#f0fdfa", color: C.teal,
                        border: "1px solid #99f6e4",
                        borderRadius: 20, padding: "2px 9px",
                        fontSize: 10, fontWeight: 700,
                      }}>{r.type}</span>
                    </td>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: C.blue }}>{r.bookings}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, background: "#e2e8f0", borderRadius: 4, height: 6, overflow: "hidden" }}>
                          <div style={{
                            width: `${r.pct}%`, height: "100%", borderRadius: 4,
                            background: `linear-gradient(90deg, ${C.teal}, ${C.green})`,
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.teal, minWidth: 34 }}>{r.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
            {loading ? "Loading…" : "No booking data yet — bookings will appear here once created."}
          </p>
        )}
      </div>

      {/* ── Quick actions ── */}
      <div style={{
        display: "flex", gap: 12, flexWrap: "wrap",
        background: "#f8fafc", borderRadius: 12,
        padding: "14px 18px", border: "1px solid #e2e8f0",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.slate, alignSelf: "center", marginRight: 4 }}>
          Quick actions:
        </span>
        {[
          { label: "📊 Full Report",     page: "report"  },
          { label: "➕ Add Resource",    page: "create"  },
          { label: "📋 View All",        page: "view"    },
          { label: "✏️ Update Resource", page: "update"  },
        ].map(a => (
          <button key={a.page} onClick={() => setCurrentPage(a.page)} style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 8, padding: "7px 14px",
            fontSize: 12, fontWeight: 600, color: "#334155",
            cursor: "pointer",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.teal}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
          >{a.label}</button>
        ))}
      </div>
    </div>
  );
}
