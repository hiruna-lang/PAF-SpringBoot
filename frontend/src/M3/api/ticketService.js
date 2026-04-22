const apiBaseUrl =
  process.env.REACT_APP_M3_API_BASE_URL ||
  "http://localhost:8081/api/module3";

function getAuthHeaders() {
  const auth = JSON.parse(localStorage.getItem("smart-campus-m3-auth") || "null");
  const headers = {};

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }
  if (auth?.user?.id) {
    headers["X-User-Id"] = auth.user.id;
  }
  if (auth?.user?.name) {
    headers["X-User-Name"] = auth.user.name;
  }
  if (auth?.role) {
    headers["X-User-Role"] = auth.role;
  }

  return headers;
}

async function request(path, { method = "GET", params, body, isFormData } = {}) {
  const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, baseUrl);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
  }

  const headers = {
    ...getAuthHeaders(),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    const message =
      errorData?.message ||
      errorData?.error ||
      response.statusText ||
      "Unable to complete the request.";

    const error = new Error(message);
    error.status = response.status;
    error.fieldErrors = errorData?.fieldErrors || {};
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function resolveAssetUrl(value) {
  if (!value) {
    return value;
  }

  try {
    return new URL(value, apiBaseUrl).toString();
  } catch {
    return value;
  }
}

function normalizeTicket(ticket) {
  return {
    ...ticket,
    attachments: (ticket.attachments || []).map((attachment) => ({
      ...attachment,
      url: resolveAssetUrl(attachment.url),
    })),
  };
}

export async function getTickets(filters) {
  const data = await request("/tickets", { params: filters });
  return data.map(normalizeTicket);
}

export async function getTechnicians() {
  return request("/technicians");
}

export async function createTechnician(payload) {
  return request("/technicians", { method: "POST", body: payload });
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

  const data = await request("/tickets", {
    method: "POST",
    body: formData,
    isFormData: true,
  });
  return normalizeTicket(data);
}

export async function assignTechnician(ticketId, technicianId) {
  const data = await request(`/tickets/${ticketId}/assign`, {
    method: "PATCH",
    body: { technicianId },
  });
  return normalizeTicket(data);
}

export async function updateTicketStatus(ticketId, nextStatus, options = {}) {
  const data = await request(`/tickets/${ticketId}/status`, {
    method: "PATCH",
    body: { status: nextStatus, ...options },
  });
  return normalizeTicket(data);
}

export async function rejectTicket(ticketId, reason) {
  const data = await request(`/tickets/${ticketId}/reject`, {
    method: "PATCH",
    body: { reason },
  });
  return normalizeTicket(data);
}

export async function addComment(ticketId, message) {
  const data = await request(`/tickets/${ticketId}/comments`, {
    method: "POST",
    body: { message },
  });
  return normalizeTicket(data);
}

export async function updateComment(ticketId, commentId, message) {
  const data = await request(`/tickets/${ticketId}/comments/${commentId}`, {
    method: "PATCH",
    body: { message },
  });
  return normalizeTicket(data);
}

export async function deleteComment(ticketId, commentId) {
  await request(`/tickets/${ticketId}/comments/${commentId}`, { method: "DELETE" });
}
