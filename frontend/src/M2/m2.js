import React from "react";
import { useNavigate } from "react-router-dom";

export default function M2() {
	const navigate = useNavigate();

	return (
		<div
			style={{
				minHeight: "100vh",
				background: "#f8fafc",
				color: "#0f172a",
				padding: "48px 28px",
				fontFamily: "Georgia, Times New Roman, serif",
			}}
		>
			<div style={{ maxWidth: "720px", margin: "0 auto" }}>
				<p style={{ letterSpacing: "0.3em", fontSize: "0.75rem", marginBottom: "12px" }}>
					MODULE 2
				</p>
				<h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>
					Student Portal
				</h1>
				<p style={{ color: "#475569", marginBottom: "24px" }}>
					This module is ready for student features like enrollment, profiles, and progress tracking.
				</p>
				<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
					<button
						onClick={() => navigate("/admin")}
						style={{
							border: "1px solid #cbd5f5",
							background: "#ffffff",
							padding: "10px 16px",
							borderRadius: "999px",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						Back to Admin Portal
					</button>
					<button
						onClick={() => navigate("/")}
						style={{
							border: "1px solid #cbd5f5",
							background: "#e2e8f0",
							padding: "10px 16px",
							borderRadius: "999px",
							fontWeight: 600,
							cursor: "pointer",
						}}
					>
						Home
					</button>
				</div>
			</div>
		</div>
	);
}
