import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, PRIORITY_LEVELS, TICKET_STATUSES } from "../constants";
import { useAuth } from "../context/AuthContext";
import { buildRolePath } from "../routes";
import { formatCompactDate } from "../utils";
import { SearchIcon } from "./Icons";
import EmptyState from "./EmptyState";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function AdminTicketTable({ tickets, technicians, onAssign, onStatus, onReject }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [filters, setFilters] = useState({
    status: "ALL",
    priority: "ALL",
    category: "ALL",
    assignedTechnician: "ALL",
    search: "",
  });
  const deferredSearch = useDeferredValue(filters.search);

  const filteredTickets = tickets.filter((ticket) => {
    if (filters.status !== "ALL" && ticket.status !== filters.status) {
      return false;
    }
    if (filters.priority !== "ALL" && ticket.priority !== filters.priority) {
      return false;
    }
    if (filters.category !== "ALL" && ticket.category !== filters.category) {
      return false;
    }
    if (filters.assignedTechnician !== "ALL" && ticket.assignedTechnicianId !== filters.assignedTechnician) {
      return false;
    }

    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return [ticket.id, ticket.resource, ticket.requesterName, ticket.assignedTechnicianName, ticket.category]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <section className="m3-surface-card">
      <div className="m3-section-header">
        <div>
          <span className="m3-eyebrow">Operations Console</span>
          <h2>All Tickets Dashboard</h2>
          <p>Search, assign technicians, update statuses, and reject invalid maintenance requests.</p>
        </div>
        <div className="m3-toolbar m3-toolbar--stack">
          <label className="m3-search-field">
            <SearchIcon />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              placeholder="Search by ticket, location, requester..."
            />
          </label>
          <div className="m3-toolbar">
            <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="ALL">All Statuses</option>
              {TICKET_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
            <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}>
              <option value="ALL">All Priorities</option>
              {PRIORITY_LEVELS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={filters.assignedTechnician}
              onChange={(event) => setFilters({ ...filters, assignedTechnician: event.target.value })}
            >
              <option value="ALL">All Technicians</option>
              <option value="">Unassigned</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredTickets.length ? (
        <div className="m3-table-shell">
          <table className="m3-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <button type="button" className="m3-link-button" onClick={() => navigate(buildRolePath(role, `tickets/${ticket.id}`))}>
                      {ticket.id}
                    </button>
                    <span className="m3-table-subcopy">{ticket.resource}</span>
                  </td>
                  <td>{ticket.category}</td>
                  <td>
                    <PriorityBadge priority={ticket.priority} />
                  </td>
                  <td>
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td>{ticket.assignedTechnicianName || "Unassigned"}</td>
                  <td>{formatCompactDate(ticket.createdAt)}</td>
                  <td>
                    <div className="m3-inline-actions">
                      <button type="button" className="m3-secondary-button" onClick={() => onAssign(ticket)}>
                        Assign Technician
                      </button>
                      <button type="button" className="m3-secondary-button" onClick={() => onStatus(ticket)}>
                        Update Status
                      </button>
                      <button type="button" className="m3-danger-button" onClick={() => onReject(ticket)}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No tickets found" message="Try adjusting the admin filters or search terms." />
      )}
    </section>
  );
}
