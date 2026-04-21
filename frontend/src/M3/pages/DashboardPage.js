import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../context/TicketContext";
import { buildRolePath } from "../routes";
import { countByStatus, formatCompactDate, pluralize } from "../utils";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";

export default function DashboardPage() {
  const { role } = useAuth();
  const { tickets } = useTickets();
  const openCount = countByStatus(tickets, "OPEN");
  const inProgressCount = countByStatus(tickets, "IN_PROGRESS");
  const resolvedCount = countByStatus(tickets, "RESOLVED");
  const criticalCount = tickets.filter((ticket) => ticket.priority === "CRITICAL").length;
  const unassignedCount = tickets.filter((ticket) => !ticket.assignedTechnicianId && ticket.status !== "REJECTED").length;
  const latestTickets = tickets.slice(0, 4);

  return (
    <div className="m3-page-stack">
      <section className="m3-hero-card m3-hero-card--editorial">
        <div className="m3-hero-card__headline">
          <span className="m3-hero-card__kicker">Campus Service Grid</span>
          <h2>
            Less dashboard.
            <br />
            More mission control.
          </h2>
          <p>
            This workspace should feel active, directional, and sharp. Requests, dispatch, and field execution stay in one
            clear rhythm instead of getting buried in flat admin panels.
          </p>

          <div className="m3-hero-card__actions">
            {role !== "TECHNICIAN" ? (
              <Link to={buildRolePath(role, "create")} className="m3-primary-button">
                Launch Ticket
              </Link>
            ) : null}
            <Link to={buildRolePath(role, "tickets")} className="m3-secondary-button">
              Enter Queue
            </Link>
          </div>
        </div>

        <div className="m3-hero-card__stage">
          <div className="m3-hero-card__spotlight">
            <span className="m3-hero-card__label">Current Pulse</span>
            <strong>{criticalCount ? `${criticalCount} critical incidents on the board` : "Queue is calm. No critical incidents."}</strong>
            <p>Use this surface to orient attention before moving deeper into the queue.</p>
          </div>

          <div className="m3-hero-card__mosaic">
            <article className="m3-hero-card__mini">
              <span>Dispatch</span>
              <strong>{unassignedCount}</strong>
              <p>tickets waiting for ownership</p>
            </article>
            <article className="m3-hero-card__mini">
              <span>Execution</span>
              <strong>{inProgressCount}</strong>
              <p>tickets currently in motion</p>
            </article>
            <article className="m3-hero-card__mini">
              <span>Resolve</span>
              <strong>{resolvedCount}</strong>
              <p>tickets ready for closeout</p>
            </article>
          </div>
        </div>

        <div className="m3-hero-card__ticker">
          <span>OPEN {openCount}</span>
          <span>IN PROGRESS {inProgressCount}</span>
          <span>UNASSIGNED {unassignedCount}</span>
          <span>CRITICAL {criticalCount}</span>
          <span>RESOLVED {resolvedCount}</span>
        </div>
      </section>

      <section className="m3-guidance-strip">
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Priority Focus</span>
          <strong>{criticalCount ? "Escalation watch is active" : "Priority posture is stable"}</strong>
          <p>
            {criticalCount
              ? "High-impact incidents are in the queue and should stay visible until ownership and progress are clear."
              : "No critical items are currently driving the queue."}
          </p>
        </article>
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Action Load</span>
          <strong>{pluralize(openCount + inProgressCount, "ticket")} require live handling</strong>
          <p>Use the queue and admin controls to move work into assignment, execution, and verified resolution.</p>
        </article>
        <article className="m3-guidance-item">
          <span className="m3-eyebrow">Experience Goal</span>
          <strong>Every section should feel operational.</strong>
          <p>Cleaner copy, stronger hierarchy, and sharper buttons help the interface behave more like a real product.</p>
        </article>
      </section>

      <section className="m3-metric-grid">
        <article className="m3-metric-card">
          <span>Open Tickets</span>
          <strong>{openCount}</strong>
          <p>{pluralize(openCount, "ticket")} waiting for active work.</p>
        </article>
        <article className="m3-metric-card">
          <span>In Progress</span>
          <strong>{inProgressCount}</strong>
          <p>Technicians are actively engaged on these requests.</p>
        </article>
        <article className="m3-metric-card">
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
          <p>Awaiting confirmation or administrative closure.</p>
        </article>
        <article className="m3-metric-card">
          <span>Critical Priority</span>
          <strong>{criticalCount}</strong>
          <p>High-impact incidents requiring immediate operational attention.</p>
        </article>
      </section>

      <section className="m3-surface-card">
        <div className="m3-section-header">
          <div>
            <span className="m3-eyebrow">Recent Queue</span>
            <h2>Latest Tickets</h2>
          </div>
          <Link to={buildRolePath(role, "tickets")} className="m3-link-button">
            Open full queue
          </Link>
        </div>
        <div className="m3-dashboard-list">
          {latestTickets.map((ticket) => (
            <Link key={ticket.id} to={buildRolePath(role, `tickets/${ticket.id}`)} className="m3-dashboard-list__item">
              <div>
                <strong>{ticket.id}</strong>
                <span>{ticket.resource}</span>
              </div>
              <div className="m3-dashboard-list__meta">
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span>{formatCompactDate(ticket.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="m3-surface-card">
        <div className="m3-section-header">
          <div>
            <span className="m3-eyebrow">Workflow Signals</span>
            <h2>What the queue is telling you</h2>
            <p>Operational framing helps users understand not just the data, but what matters next.</p>
          </div>
        </div>
        <div className="m3-insight-stack">
          <article className="m3-insight-card">
            <span>Ownership</span>
            <strong>{unassignedCount}</strong>
            <p>Tickets without technician ownership remain exposed and should be dispatched quickly.</p>
          </article>
          <article className="m3-insight-card">
            <span>Throughput</span>
            <strong>{resolvedCount}</strong>
            <p>Resolved work indicates momentum, but final closeout still depends on confirmation and review.</p>
          </article>
          <article className="m3-insight-card">
            <span>Visibility</span>
            <strong>{latestTickets.length}</strong>
            <p>The latest queue cards surface recent activity without forcing users into dense tables first.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
