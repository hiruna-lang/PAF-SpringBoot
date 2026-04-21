import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CommentSection from "../components/CommentSection";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import TicketDetails from "../components/TicketDetails";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../context/TicketContext";
import { buildRolePath } from "../routes";
import { getAllowedTransitions } from "../utils";
import { VALIDATION_LIMITS } from "../validation";

export default function TicketDetailsPage() {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const { role, user } = useAuth();
  const { tickets, technicians, addComment, editComment, deleteComment, assignTechnician, updateStatus, rejectTicket, isBootstrapping } =
    useTickets();
  const ticket = tickets.find((item) => item.id === ticketId);
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [technicianChoice, setTechnicianChoice] = useState(ticket?.assignedTechnicianId || "");
  const [statusChoice, setStatusChoice] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState(ticket?.resolutionNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isBootstrapping && !ticket) {
    return <LoadingSpinner label="Loading ticket details..." />;
  }

  if (!ticket) {
    return (
      <EmptyState
        title="Ticket not found"
        message="The requested ticket is unavailable for your current role."
        action={
          <button type="button" className="m3-primary-button" onClick={() => navigate(buildRolePath(role, "tickets"))}>
            Back to tickets
          </button>
        }
      />
    );
  }

  const canTechnicianWork = role === "TECHNICIAN" && ticket.assignedTechnicianId === user?.id;
  const allowedTransitions = getAllowedTransitions(ticket.status);

  let actionPanel = (
    <section className="m3-surface-card">
      <div className="m3-section-header">
        <div>
          <span className="m3-eyebrow">Workflow Status</span>
          <h2>Read Only View</h2>
          <p>This ticket is visible for collaboration and progress tracking.</p>
        </div>
      </div>
    </section>
  );

  if (role === "ADMIN") {
    actionPanel = (
      <section className="m3-surface-card">
        <div className="m3-section-header">
          <div>
            <span className="m3-eyebrow">Admin Actions</span>
            <h2>Queue Controls</h2>
          </div>
        </div>
        <div className="m3-action-stack">
          <button type="button" className="m3-primary-button" onClick={() => setAssignOpen(true)}>
            Assign Technician
          </button>
          <button type="button" className="m3-secondary-button" onClick={() => setStatusOpen(true)} disabled={!allowedTransitions.length}>
            Update Status
          </button>
          <button type="button" className="m3-danger-button" onClick={() => setRejectOpen(true)} disabled={ticket.status === "REJECTED"}>
            Reject Ticket
          </button>
        </div>
      </section>
    );
  } else if (canTechnicianWork) {
    actionPanel = (
      <section className="m3-surface-card">
        <div className="m3-section-header">
          <div>
            <span className="m3-eyebrow">Technician Workbench</span>
            <h2>Progress Update</h2>
          </div>
        </div>

        <div className="m3-form-field">
          <label htmlFor="resolutionNotes">Resolution Notes</label>
          <textarea
            id="resolutionNotes"
            rows="4"
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            placeholder="Required before marking this ticket resolved."
            maxLength={VALIDATION_LIMITS.resolution.maxNotesLength}
          />
        </div>

        <div className="m3-action-stack">
          {allowedTransitions.map((status) => (
            <button
              key={status}
              type="button"
              className={status === "RESOLVED" ? "m3-primary-button" : "m3-secondary-button"}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await updateStatus(ticket.id, status, status === "RESOLVED" ? { resolutionNotes } : {});
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting || (status === "RESOLVED" && !resolutionNotes.trim())}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <>
      <TicketDetails
        ticket={ticket}
        actionPanel={actionPanel}
        commentSection={
          <CommentSection
            ticket={ticket}
            currentUserId={user?.id}
            onAddComment={(message) => addComment(ticket.id, message)}
            onEditComment={(commentId, message) => editComment(ticket.id, commentId, message)}
            onDeleteComment={(commentId) => deleteComment(ticket.id, commentId)}
            disabled={ticket.status === "CLOSED"}
          />
        }
      />

      <Modal
        open={assignOpen}
        title="Assign Technician"
        subtitle={`Select a technician for ${ticket.id}.`}
        onClose={() => setAssignOpen(false)}
        footer={
          <>
            <button type="button" className="m3-secondary-button" onClick={() => setAssignOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="m3-primary-button"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await assignTechnician(ticket.id, technicianChoice);
                  setAssignOpen(false);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </button>
          </>
        }
      >
        <div className="m3-form-field">
          <label htmlFor="ticketTechnician">Technician</label>
          <select id="ticketTechnician" value={technicianChoice} onChange={(event) => setTechnicianChoice(event.target.value)}>
            <option value="">Unassigned</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>
                {technician.name} - {technician.specialization}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <Modal
        open={statusOpen}
        title="Update Status"
        subtitle="Only allowed transitions are shown for this ticket."
        onClose={() => setStatusOpen(false)}
        footer={
          <>
            <button type="button" className="m3-secondary-button" onClick={() => setStatusOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="m3-primary-button"
              disabled={isSubmitting || !statusChoice}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await updateStatus(ticket.id, statusChoice, statusChoice === "RESOLVED" ? { resolutionNotes } : {});
                  setStatusOpen(false);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Update"}
            </button>
          </>
        }
      >
        <div className="m3-form-field">
          <label htmlFor="ticketStatus">Allowed Transition</label>
          <select id="ticketStatus" value={statusChoice} onChange={(event) => setStatusChoice(event.target.value)}>
            <option value="">Select status</option>
            {allowedTransitions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        {statusChoice === "RESOLVED" ? (
          <div className="m3-form-field">
            <label htmlFor="modalResolutionNotes">Resolution Notes</label>
            <textarea
              id="modalResolutionNotes"
              rows="4"
              value={resolutionNotes}
              onChange={(event) => setResolutionNotes(event.target.value)}
              placeholder="Required before marking the ticket resolved."
              maxLength={VALIDATION_LIMITS.resolution.maxNotesLength}
            />
          </div>
        ) : null}
      </Modal>

      <Modal
        open={rejectOpen}
        title="Reject Ticket"
        subtitle="Rejected tickets require an audit-ready reason."
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <button type="button" className="m3-secondary-button" onClick={() => setRejectOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="m3-danger-button"
              disabled={isSubmitting || !rejectionReason.trim()}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await rejectTicket(ticket.id, rejectionReason);
                  setRejectOpen(false);
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              {isSubmitting ? "Saving..." : "Reject"}
            </button>
          </>
        }
      >
        <div className="m3-form-field">
          <label htmlFor="rejectReason">Reason</label>
          <textarea
            id="rejectReason"
            rows="4"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Explain why this ticket should be rejected."
            maxLength={VALIDATION_LIMITS.rejection.maxReasonLength}
          />
        </div>
      </Modal>
    </>
  );
}
