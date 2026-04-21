export function formatDate(value, options = {}) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(new Date(value));
}

export function formatCompactDate(value) {
  return formatDate(value, { hour: undefined, minute: undefined });
}

export function getAllowedTransitions(status) {
  switch (status) {
    case "OPEN":
      return ["IN_PROGRESS"];
    case "IN_PROGRESS":
      return ["RESOLVED"];
    case "RESOLVED":
      return ["CLOSED"];
    default:
      return [];
  }
}

export function countByStatus(tickets, status) {
  return tickets.filter((ticket) => ticket.status === status).length;
}

export function pluralize(value, label) {
  return `${value} ${label}${value === 1 ? "" : "s"}`;
}
