const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api/module3";

function getAuthHeaders() {
  const auth = JSON.parse(localStorage.getItem("smart-campus-m3-auth") || "null");
  const headers = { "Content-Type": "application/json" };
  if (auth?.token)       headers["Authorization"]  = `Bearer ${auth.token}`;
  if (auth?.user?.id)    headers["X-User-Id"]       = auth.user.id;
  if (auth?.user?.name)  headers["X-User-Name"]     = auth.user.name;
  if (auth?.role)        headers["X-User-Role"]     = auth.role;
  return headers;
}

function getAuthHeadersNoContentType() {
  const h = getAuthHeaders();
  delete h["Content-Type"];
  return h;
}

async function toApiError(res) {
  let body = {};
  try { body = await res.json(); } catch { /* ignore */ }
  const message = body?.message || body?.error || `Request failed with status ${res.status}`;
  const err = new Error(message);
  err.status = res.status;
  err.fieldErrors = body?.fieldErrors || {};
  return err;
}

function resolveAssetUrl(value) {
  if (!value) return value;
  try { return new URL(value, apiBaseUrl).toString(); } catch { return value; }
}

function normalizeTicket(ticket) {
  return {
    ...ticket,
    attachments: (ticket.attachments || []).map((a) => ({
      ...a,
      url: resolveAssetUrl(a.url),
    })),
  };
}

export async function getTickets(filters = {}) {
  const params = new URLSearchParams(filters).toString();
  const url = `${apiBaseUrl}/tickets${params ? `?${params}` : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw await toApiError(res);
  const data = await res.json();
  return data.map(normalizeTicket);
}

export async function getTechnicians() {
  const res = await fetch(`${apiBaseUrl}/technicians`, { headers: getAuthHeaders() });
  if (!res.ok) throw await toApiError(res);
  return res.json();
}

export async function createTechnician(payload) {
  const res = await fetch(`${apiBaseUrl}/technicians`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toApiError(res);
  return res.json();
}

export async function createTicket(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "attachments") {
      value.forEach((file) => formData.append("attachments", file.file));
    } else {
      formData.append(key, value);
    }
  });
  const res = await fetch(`${apiBaseUrl}/tickets`, {
    method: "POST",
    headers: getAuthHeadersNoContentType(),
    body: formData,
  });
  if (!res.ok) throw await toApiError(res);
  return normalizeTicket(await res.json());
}

export async function assignTechnician(ticketId, technicianId) {
  const res = await fetch(`${apiBaseUrl}/tickets/${ticketId}/assign`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ technicianId }),
  });
  if (!res.ok) throw await toApiError(res);
  return normalizeTicket(await res.json());
}

export async function updateTicketStatus(ticketId, nextStatus, options = {}) {
  const res = await fetch(`${apiBaseUrl}/tickets/${ticketId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: nextStatus, ...options }),
  });
  if (!res.ok) throw await toApiError(res);
  return normalizeTicket(await res.json());
}

export async function rejectTicket(ticketId, reason) {
  const res = await fetch(`${apiBaseUrl}/tickets/${ticketId}/reject`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw await toApiError(res);
  return normalizeTicket(await res.json());
}

export async function addComment(ticketId, message) {
  const res = await fetch(`${apiBaseUrl}/tickets/${ticketId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw await toApiError(res);
  return normalizeTicket(await res.json());
}

export async function updateComment(ticketId, commentId, message) {
  const res = await fetch(`${apiBaseUrl}/tickets/${ticketId}/comments/${commentId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw await toApiError(res);
  return normalizeTicket(await res.json());
}

export async function deleteComment(ticketId, commentId) {
  const res = await fetch(`${apiBaseUrl}/tickets/${ticketId}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await toApiError(res);
}
