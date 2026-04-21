import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminTicketTable from "../components/AdminTicketTable";
import Modal from "../components/Modal";
import TicketList from "../components/TicketList";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../context/TicketContext";
import { buildRolePath, getRoleBasePath } from "../routes";
import { getAllowedTransitions } from "../utils";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { tickets, technicians, assignTechnician, updateStatus, rejectTicket } = useTickets();
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [technicianChoice, setTechnicianChoice] = useState("");
  const [statusChoice, setStatusChoice] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAssignConfirm() {
    setIsSubmitting(true);
    try {
      await assignTechnician(assignTarget.id, technicianChoice);
      setAssignTarget(null);
      setTechnicianChoice("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusConfirm() {
    setIsSubmitting(true);
    try {
      await updateStatus(statusTarget.id, statusChoice, {});
      setStatusTarget(null);
      setStatusChoice("");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRejectConfirm() {
    setIsSubmitting(true);
    try {
      await rejectTicket(rejectTarget.id, reason);
      setRejectTarget(null);
      setReason("");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (role === "ADMIN") {
    return (
      <>
        <AdminTicketTable
          tickets={tickets}
          technicians={technicians}
          onAssign={(ticket) => {
            setAssignTarget(ticket);
            setTechnicianChoice(ticket.assignedTechnicianId || "");
          }}
          onStatus={(ticket) => {
            setStatusTarget(ticket);
            setStatusChoice(getAllowedTransitions(ticket.status)[0] || "");
          }}
          onReject={setRejectTarget}
        />

        <Modal
          open={Boolean(assignTarget)}
          title="Assign Technician"
          subtitle={assignTarget ? `Dispatch field ownership for ${assignTarget.id}.` : ""}
          onClose={() => setAssignTarget(null)}
          footer={
            <>
              <button type="button" className="m3-secondary-button" onClick={() => setAssignTarget(null)}>
                Cancel
              </button>
              <button type="button" className="m3-primary-button" disabled={isSubmitting} onClick={handleAssignConfirm}>
                {isSubmitting ? "Saving..." : "Confirm Assignment"}
              </button>
            </>
          }
        >
          <div className="m3-form-field">
            <label htmlFor="technician">Technician</label>
            <select id="technician" value={technicianChoice} onChange={(event) => setTechnicianChoice(event.target.value)}>
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
          open={Boolean(statusTarget)}
          title="Update Status"
          subtitle={statusTarget ? `Only valid transitions are available for ${statusTarget.id}.` : ""}
          onClose={() => setStatusTarget(null)}
          footer={
            <>
              <button type="button" className="m3-secondary-button" onClick={() => setStatusTarget(null)}>
                Cancel
              </button>
              <button type="button" className="m3-primary-button" disabled={isSubmitting || !statusChoice} onClick={handleStatusConfirm}>
                {isSubmitting ? "Saving..." : "Update Status"}
              </button>
            </>
          }
        >
          <div className="m3-form-field">
            <label htmlFor="status">Allowed Transition</label>
            <select id="status" value={statusChoice} onChange={(event) => setStatusChoice(event.target.value)}>
              <option value="">Select next status</option>
              {statusTarget
                ? getAllowedTransitions(statusTarget.status).map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))
                : null}
            </select>
          </div>
        </Modal>

        <Modal
          open={Boolean(rejectTarget)}
          title="Reject Ticket"
          subtitle={rejectTarget ? `Provide an operational reason for rejecting ${rejectTarget.id}.` : ""}
          onClose={() => setRejectTarget(null)}
          footer={
            <>
              <button type="button" className="m3-secondary-button" onClick={() => setRejectTarget(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="m3-danger-button"
                disabled={isSubmitting || !reason.trim()}
                onClick={handleRejectConfirm}
              >
                {isSubmitting ? "Saving..." : "Reject Ticket"}
              </button>
            </>
          }
        >
          <div className="m3-form-field">
            <label htmlFor="reason">Reason</label>
            <textarea id="reason" rows="4" value={reason} onChange={(event) => setReason(event.target.value)} />
          </div>
        </Modal>
      </>
    );
  }

  const title = role === "TECHNICIAN" ? "Assigned Tickets" : "My Tickets";
  const subtitle =
    role === "TECHNICIAN"
      ? "Track field assignments, filter by status or priority, and open any ticket for work updates."
      : "Review every ticket you have raised, track statuses, and open any item for full details.";
  const emptyAction =
    role === "USER" ? (
      <Link to={buildRolePath(role, "create")} className="m3-primary-button">
        Create your first ticket
      </Link>
    ) : (
      <button type="button" className="m3-secondary-button" onClick={() => navigate(getRoleBasePath(role))}>
        Back to dashboard
      </button>
    );

  return <TicketList tickets={tickets} emptyAction={emptyAction} title={title} subtitle={subtitle} />;
}
