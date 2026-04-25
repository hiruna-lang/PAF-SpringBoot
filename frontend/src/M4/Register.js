import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, saveAuth, loginWithGoogle } from "./authService";
import "./M4.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", phoneNumber: "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                      e.name = "Name is required";
    if (!form.email.trim())                     e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password)                         e.password = "Password is required";
    else if (form.password.length < 6)          e.password = "Minimum 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) { setErrors(ve); return; }

    setLoading(true);
    try {
      const response = await registerUser({
        name: form.name, email: form.email,
        password: form.password, phoneNumber: form.phoneNumber,
      });
      saveAuth(response);
      // After sign-up, go to home page
      navigate("/home");
    } catch (err) {
      setApiError(err.message === "Failed to fetch"
        ? "Cannot connect to server. Make sure the backend is running."
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">🎓</div>
          <span className="auth-brand-name">SmartCampus</span>
        </div>

        <h2>Create Account</h2>
        <p className="subtitle">Join thousands of students today</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input id="name" name="name" type="text" placeholder="John Doe"
                value={form.name} onChange={handleChange}
                className={errors.name ? "input-error" : ""} />
            </div>
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input id="email" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
                className={errors.email ? "input-error" : ""} />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phoneNumber">
              Phone&nbsp;
              <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, textTransform: "none" }}>
                (optional)
              </span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">📱</span>
              <input id="phoneNumber" name="phoneNumber" type="tel"
                placeholder="+94 77 123 4567"
                value={form.phoneNumber} onChange={handleChange} />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input id="password" name="password" type="password"
                placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                className={errors.password ? "input-error" : ""} />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input id="confirmPassword" name="confirmPassword" type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword} onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""} />
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div className="divider">or continue with</div>

        <button className="btn-google" onClick={loginWithGoogle} type="button">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-footer">
          Already have an account?{" "}
          <span className="link" onClick={() => navigate("/m4/login")}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

export default Register;
