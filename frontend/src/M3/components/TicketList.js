import { useDeferredValue, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PRIORITY_LEVELS, TICKET_STATUSES } from "../constants";
import { buildRolePath } from "../routes";
import { formatCompactDate } from "../utils";
import EmptyState from "./EmptyState";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";

export default function TicketList({ tickets, emptyAction, title, subtitle }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [filters, setFilters] = useState({ status: "ALL", priority: "ALL" });
  const deferredFilters = useDeferredValue(filters);

  const filteredTickets = tickets.filter((ticket) => {
    if (deferredFilters.status !== "ALL" && ticket.status !== deferredFilters.status) {
      return false;
    }
    if (deferredFilters.priority !== "ALL" && ticket.priority !== deferredFilters.priority) {
      return false;
    }
    return true;
  });

  return (
    <section className="m3-surface-card">
      <div className="m3-section-header">
        <div>
          <span className="m3-eyebrow">Ticket Queue</span>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="m3-toolbar">
          <span className="m3-filter-count">{filteredTickets.length} visible</span>
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
        </div>
      </div>

      {filteredTickets.length ? (
        <div className="m3-ticket-list">
          {filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              className="m3-ticket-row"
              onClick={() => navigate(buildRolePath(role, `tickets/${ticket.id}`))}
            >
              <div className="m3-ticket-row__identity">
                <strong>{ticket.id}</strong>
                <span>{ticket.resource}</span>
              </div>
              <div className="m3-ticket-row__meta">
                <span>{ticket.category}</span>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
                <span>{formatCompactDate(ticket.createdAt)}</span>
                <span className="m3-ticket-row__arrow">Open Ticket</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tickets found"
          message="There are no tickets matching the selected filters."
          action={emptyAction}
        />
      )}
    </section>
  );
}
