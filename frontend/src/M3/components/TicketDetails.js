import { formatDate } from "../utils";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

const timelineOrder = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketDetails({ ticket, actionPanel, commentSection }) {
  return (
    <div className="m3-detail-grid">
      <section className="m3-surface-card">
        <div className="m3-detail-header">
          <div>
            <span className="m3-eyebrow">Ticket Details</span>
            <h1>{ticket.id}</h1>
            <p>{ticket.resource}</p>
          </div>
          <div className="m3-detail-header__badges">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="m3-detail-summary">
          <div>
            <span>Category</span>
            <strong>{ticket.category}</strong>
          </div>
          <div>
            <span>Created</span>
            <strong>{formatDate(ticket.createdAt)}</strong>
          </div>
          <div>
            <span>Assigned Technician</span>
            <strong>{ticket.assignedTechnicianName || "Unassigned"}</strong>
          </div>
          <div>
            <span>Preferred Contact</span>
            <strong>{ticket.preferredContact}</strong>
          </div>
        </div>

        <div className="m3-copy-block">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>

        {ticket.rejectionReason ? (
          <div className="m3-alert-card m3-alert-card--danger">
            <h3>Rejection Reason</h3>
            <p>{ticket.rejectionReason}</p>
          </div>
        ) : null}

        {ticket.resolutionNotes ? (
          <div className="m3-alert-card m3-alert-card--success">
            <h3>Resolution Notes</h3>
            <p>{ticket.resolutionNotes}</p>
          </div>
        ) : null}

        <div className="m3-copy-block">
          <h3>Attachments</h3>
          {ticket.attachments.length ? (
            <div className="m3-attachment-grid">
              {ticket.attachments.map((attachment) => (
                <div key={attachment.id} className="m3-attachment-card">
                  <img src={attachment.url} alt={attachment.name} />
                  <div className="m3-attachment-card__footer">
                    <span>{attachment.name}</span>
                    <a href={attachment.url} target="_blank" rel="noreferrer" className="m3-link-button">
                      Open File
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="m3-empty-inline">No attachments were provided for this ticket.</div>
          )}
        </div>

        <div className="m3-copy-block">
          <h3>Status Timeline</h3>
          <ol className="m3-timeline">
            {timelineOrder.map((status) => {
              const item = ticket.timeline.find((step) => step.status === status);
              const isActive = ticket.status === status || ticket.timeline.some((step) => step.status === status);

              return (
                <li key={status} className={`m3-timeline__item ${isActive ? "is-active" : ""}`}>
                  <div className="m3-timeline__dot" />
                  <div>
                    <strong>{status.replace("_", " ")}</strong>
                    <span>{item ? formatDate(item.createdAt) : "Pending"}</span>
                    {item ? <p>{item.note}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div className="m3-detail-sidebar">
        {actionPanel}
        {commentSection}
      </div>
    </div>
  );
}
