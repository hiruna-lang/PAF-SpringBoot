import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUser, getToken, logout, isLoggedIn,
  savePhoto, savePhotoToServer, loadProfileFromServer,
  getUserId, updateProfile, deleteAccount,
} from "./authService";
import "./ProfilePage.css";

function decodeJwt(t) {
  try { return JSON.parse(atob(t.split(".")[1])); } catch { return null; }
}
function fmtExpiry(s) {
  if (s <= 0) return "Expired";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  // Always read fresh from localStorage so updates reflect immediately
  const getLatestUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  };

  const token = getToken();
  const [user, setUser] = useState(getLatestUser);

  const [photo,       setPhoto]       = useState(user?.photoUrl || null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMsg,    setPhotoMsg]    = useState(null);   // { text, ok }

  const [editing,    setEditing]    = useState(false);
  const [editName,   setEditName]   = useState(user?.name || "");
  const [editPhone,  setEditPhone]  = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg,    setEditMsg]    = useState(null);     // { text, ok }

  const [showDelete,  setShowDelete]  = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting,    setDeleting]    = useState(false);
  const [deleteErr,   setDeleteErr]   = useState("");

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const p = decodeJwt(token);
    return p?.exp ? p.exp - Math.floor(Date.now() / 1000) : 0;
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn()) navigate("/m4/login", { replace: true });
  }, [navigate]);

  // Load fresh photo from server
  useEffect(() => {
    loadProfileFromServer().then(() => {
      const fresh = getLatestUser();
      if (fresh.photoUrl) setPhoto(fresh.photoUrl);
      if (fresh.name)     setEditName(fresh.name);
      setUser(fresh);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Session countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timer); logout(); navigate("/m4/login"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [navigate]);

  // ── Photo upload ───────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPhotoMsg({ text: "Image too large. Max 2 MB.", ok: false });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
      savePhoto(dataUrl);
      setPhotoSaving(true);
      setPhotoMsg(null);
      try {
        await savePhotoToServer(dataUrl);
        setPhotoMsg({ text: "Photo saved!", ok: true });
        setUser(getLatestUser());
      } catch {
        setPhotoMsg({ text: "Failed to save photo. Try again.", ok: false });
      } finally {
        setPhotoSaving(false);
        setTimeout(() => setPhotoMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // ── Profile update ─────────────────────────────────────────
  const handleSave = async () => {
    if (!editName.trim()) {
      setEditMsg({ text: "Name cannot be empty.", ok: false });
      return;
    }
    setEditSaving(true);
    setEditMsg(null);
    try {
      await updateProfile({ name: editName.trim(), phoneNumber: editPhone.trim() });
      const fresh = getLatestUser();
      setUser(fresh);
      setEditMsg({ text: "Profile updated successfully!", ok: true });
      setEditing(false);
      setTimeout(() => setEditMsg(null), 3000);
    } catch (err) {
      setEditMsg({ text: err.message || "Update failed.", ok: false });
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete account ─────────────────────────────────────────
  const handleDelete = async () => {
    if (deleteInput !== "DELETE") {
      setDeleteErr('Please type "DELETE" to confirm.');
      return;
    }
    setDeleting(true);
    setDeleteErr("");
    try {
      await deleteAccount();
      navigate("/m4/register", { replace: true });
    } catch (err) {
      setDeleteErr(err.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  if (!user?.email) return null;

  const initial      = user.name ? user.name.charAt(0).toUpperCase() : "?";
  const userId       = getUserId() || user.userId || "—";
  const loginTime    = localStorage.getItem("loginTime");
  const loginDisplay = loginTime
    ? new Date(Number(loginTime)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const roleCls  = user.role === "ADMIN" ? "pp-badge-admin" : user.role === "TECHNICIAN" ? "pp-badge-tech" : "pp-badge-user";
  const roleIcon = user.role === "ADMIN" ? "👑" : user.role === "TECHNICIAN" ? "🔧" : "👤";

  return (
    <div className="pp-root">

      {/* ── Top bar ── */}
      <header className="pp-topbar">
        <button className="pp-back-btn" onClick={() => navigate("/home")}>← Back to Home</button>
        <div className="pp-brand">
          <div className="pp-brand-icon">🎓</div>
          <span className="pp-brand-name">SmartCampus</span>
        </div>
        <button className="pp-signout-btn" onClick={() => { logout(); navigate("/m4/login"); }}>
          Sign Out
        </button>
      </header>

      <main className="pp-main">

        {/* ── Avatar card ── */}
        <div className="pp-card pp-avatar-card">
          <div className="pp-avatar-ring">
            <div className="pp-avatar">
              {photo ? <img src={photo} alt="profile" /> : <span>{initial}</span>}
            </div>
            <button className="pp-photo-btn" onClick={() => fileRef.current?.click()} disabled={photoSaving} title="Change photo">
              {photoSaving ? "⏳" : "📷"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
          </div>

          <h1 className="pp-name">{user.name || "—"}</h1>
          <p className="pp-email">{user.email}</p>

          {photoMsg && (
            <p className={`pp-msg ${photoMsg.ok ? "pp-msg-ok" : "pp-msg-err"}`}>{photoMsg.text}</p>
          )}

          <div className="pp-badges">
            <span className={`pp-badge ${roleCls}`}>{roleIcon} {user.role}</span>
            <span className={`pp-badge ${user.provider === "GOOGLE" ? "pp-badge-google" : "pp-badge-local"}`}>
              {user.provider === "GOOGLE" ? "🔵 Google" : "🔒 Local"}
            </span>
          </div>

          <button className="pp-change-photo-btn" onClick={() => fileRef.current?.click()} disabled={photoSaving}>
            {photoSaving ? "⏳ Saving…" : "📷 Change Photo"}
          </button>
        </div>

        {/* ── Account details + edit ── */}
        <div className="pp-card">
          <div className="pp-card-header">
            <h2 className="pp-card-title">Account Details</h2>
            {!editing && (
              <button className="pp-edit-btn" onClick={() => {
                setEditName(user.name || "");
                setEditPhone("");
                setEditing(true);
                setEditMsg(null);
              }}>✏️ Edit Profile</button>
            )}
          </div>

          {editMsg && (
            <p className={`pp-msg ${editMsg.ok ? "pp-msg-ok" : "pp-msg-err"}`} style={{ marginBottom: 16 }}>
              {editMsg.ok ? "✅ " : "⚠️ "}{editMsg.text}
            </p>
          )}

          {editing ? (
            <div className="pp-edit-form">
              <div className="pp-field">
                <label className="pp-label">Full Name <span className="pp-req">*</span></label>
                <input
                  className="pp-input"
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={80}
                />
              </div>
              <div className="pp-field">
                <label className="pp-label">Phone Number <span className="pp-optional">(optional)</span></label>
                <input
                  className="pp-input"
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  maxLength={20}
                />
              </div>
              <div className="pp-row">
                <button className="pp-save-btn" onClick={handleSave} disabled={editSaving}>
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
                <button className="pp-cancel-btn" onClick={() => { setEditing(false); setEditMsg(null); }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="pp-detail-list">
              {[
                { label: "User ID",      value: userId },
                { label: "Full Name",    value: user.name || "—" },
                { label: "Email",        value: user.email },
                { label: "Role",         value: user.role || "USER" },
                { label: "Provider",     value: user.provider },
                { label: "Logged In",    value: loginDisplay },
                { label: "Session",      value: fmtExpiry(secondsLeft) },
              ].map(d => (
                <div key={d.label} className="pp-detail-row">
                  <span className="pp-detail-label">{d.label}</span>
                  <span className="pp-detail-value">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Danger zone ── */}
        <div className="pp-card pp-danger-card">
          <h2 className="pp-card-title pp-danger-title">⚠️ Danger Zone</h2>
          <p className="pp-danger-desc">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>

          {!showDelete ? (
            <button className="pp-delete-btn" onClick={() => { setShowDelete(true); setDeleteInput(""); setDeleteErr(""); }}>
              🗑️ Delete My Account
            </button>
          ) : (
            <div className="pp-delete-confirm">
              <p className="pp-delete-warning">
                Type <strong>DELETE</strong> to confirm permanent account deletion.
              </p>
              <input
                className={`pp-input ${deleteErr ? "pp-input-err" : ""}`}
                type="text"
                value={deleteInput}
                onChange={e => { setDeleteInput(e.target.value); setDeleteErr(""); }}
                placeholder='Type DELETE here'
                autoComplete="off"
              />
              {deleteErr && <p className="pp-err-text">{deleteErr}</p>}
              <div className="pp-row">
                <button className="pp-delete-confirm-btn" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
                <button className="pp-cancel-btn" onClick={() => { setShowDelete(false); setDeleteErr(""); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
