import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../constants";
import { getRoleBasePath } from "../routes";

export default function AccessGatePage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const roleCards = {
    USER: {
      title: "Request Studio",
      description: "Raise issues, attach visual evidence, and follow every operational update from one polished workspace.",
      meta: "Best for students, staff, and request owners",
    },
    ADMIN: {
      title: "Control Deck",
      description: "Direct triage, assign technicians, manage escalations, and keep the queue moving with confidence.",
      meta: "Best for service desk and operations leads",
    },
    TECHNICIAN: {
      title: "Field Console",
      description: "Open assigned work, post progress updates, and close the loop with structured resolution notes.",
      meta: "Best for execution teams and on-site responders",
    },
  };

  function handleAccess(role) {
    signIn(role);
    navigate(getRoleBasePath(role), { replace: true });
  }

  return (
    <div className="m3-access">
      <div className="m3-access__hero-grid">
        <div className="m3-access__hero">
          <span className="m3-eyebrow">Smart Campus Operations Hub</span>
          <h1>A sharper ticketing workspace for campus operations.</h1>
          <p>
            Step into a role-based experience designed like a real product: clearer status framing, stronger sectioning,
            and faster action paths for requests, triage, and field execution.
          </p>
        </div>

        <section className="m3-access__signal-card">
          <span className="m3-eyebrow">Workspace Modes</span>
          <h2>Three perspectives. One operational source of truth.</h2>
          <div className="m3-access__signal-list">
            <article className="m3-access__signal-item">
              <strong>Intake Layer</strong>
              <p>Capture issues with context, contact details, and supporting images.</p>
            </article>
            <article className="m3-access__signal-item">
              <strong>Decision Layer</strong>
              <p>Spot priority, dispatch ownership, and keep queue governance visible.</p>
            </article>
            <article className="m3-access__signal-item">
              <strong>Execution Layer</strong>
              <p>Let technicians focus on the next valid action instead of hunting for context.</p>
            </article>
          </div>
        </section>
      </div>

      <div className="m3-access__roles">
        {Object.values(USER_ROLES).map((role) => (
          <button key={role} type="button" className="m3-access-card" onClick={() => handleAccess(role)}>
            <span className="m3-access-card__badge">{role}</span>
            <h2>{roleCards[role].title}</h2>
            <p>{roleCards[role].description}</p>
            <div className="m3-access-card__footer">
              <span className="m3-access-card__meta">{roleCards[role].meta}</span>
              <span className="m3-primary-button">Enter Workspace</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
