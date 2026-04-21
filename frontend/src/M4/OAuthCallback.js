import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveAuth } from "./authService";
import "./M4.css";

function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const role   = params.get("role") || "USER";
    const name   = params.get("name") || "";
    const photo  = params.get("photo") || "";

    if (!token) {
      setError("Google login failed — no token received.");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      saveAuth({
        token,
        email:    payload.sub,
        name:     decodeURIComponent(name) || payload.sub,
        provider: "GOOGLE",
        role,
        photoUrl: decodeURIComponent(photo) || null,
      });
      // Redirect based on role
      navigate(role === "ADMIN" ? "/m4/admin" : "/m4/dashboard", { replace: true });
    } catch {
      setError("Failed to process Google login. Please try again.");
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="callback-wrapper">
        <div className="alert alert-error" style={{ maxWidth: 360 }}>{error}</div>
        <button className="btn-primary" style={{ maxWidth: 200 }}
          onClick={() => navigate("/m4/login")}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="callback-wrapper">
      <div className="spinner" aria-label="Loading" />
      <p>Completing Google sign-in…</p>
    </div>
  );
}

export default OAuthCallback;
