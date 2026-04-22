import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { TicketProvider, useTickets } from "../context/TicketContext";
import { ToastProvider } from "../context/ToastContext";
import TicketForm from "../components/TicketForm";
import { DEMO_PROFILES, USER_ROLES } from "../constants";
import "../M3.css";
import "./StandaloneCreateTicket.css";

// Always force USER auth for this standalone page —
// overwrite any existing M3 session (admin/technician) that may be stored.
const USER_AUTH = {
  token: "demo-user-token",
  role: USER_ROLES.USER,
  user: DEMO_PROFILES.USER,
};
const STORAGE_KEY = "smart-campus-m3-auth";

function forceUserAuth() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(USER_AUTH));
}

/* ─── Inner content (needs AuthContext + TicketContext) ─── */
function CreateTicketContent() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signIn } = useAuth();
  const { createTicket } = useTickets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sign in as USER on mount if not already authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      signIn(USER_ROLES.USER);
    }
  }, [isAuthenticated, signIn]);

  const phoneRegex = /^[0-9]{10}$/;

  async function handleSubmit(payload) {
    if (!phoneRegex.test(payload.preferredContact)) {
      alert("Phone number must contain exactly 10 digits (numbers only)");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicket(payload);
      setSubmitted(true);
    } catch (error) {
      console.error("Ticket creation error:", error);
      alert(error?.message || "Error creating ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="sct-page">
      {/* ── Navbar ── */}
      <nav className="sct-nav">
        <button className="sct-nav-back" onClick={() => navigate("/")}>
          ← Home
        </button>
        <div className="sct-nav-brand">
          <span className="sct-nav-brand-icon">SC</span>
          <span className="sct-nav-brand-name">Support Desk</span>
        </div>
        <div className="sct-nav-actions">
          <button className="sct-nav-btn-secondary" onClick={() => navigate("/m3/user/tickets")}>
            View My Tickets
          </button>
        </div>
      </nav>

      <div className="sct-container">
        {submitted ? (
          /* ── Success state ── */
          <div className="sct-success">
            <div className="sct-success-icon">✅</div>
            <h2>Ticket Submitted!</h2>
            <p>
              Your maintenance request has been received and is now in the queue.
              Our team will review it shortly.
            </p>
            <div className="sct-success-actions">
              <button className="sct-btn-primary" onClick={() => setSubmitted(false)}>
                Submit Another Ticket
              </button>
              <button className="sct-btn-secondary" onClick={() => navigate("/m3/user/tickets")}>
                View My Tickets
              </button>
              <button className="sct-btn-ghost" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <TicketForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            defaultContact={user?.phone || ""}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Wrapper: seeds auth then mounts providers ─── */
export default function StandaloneCreateTicketPage() {
  // Ensure USER auth is in localStorage before any provider reads it
  forceUserAuth();

  return (
    <AuthProvider>
      <ToastProvider>
        <TicketProvider>
          <CreateTicketContent />
        </TicketProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
