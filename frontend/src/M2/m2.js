import React from "react";
import { useNavigate } from "react-router-dom";

export default function M2() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      gap: "16px",
    }}>
      <div style={{ fontSize: "3rem" }}>👥</div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
        Student Portal
      </h1>
      <p style={{ color: "#6b7280", fontSize: "1rem", margin: 0 }}>
        Module 2 — Coming soon
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "8px",
          padding: "10px 24px",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: 700,
          fontSize: "0.9rem",
          cursor: "pointer",
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}
