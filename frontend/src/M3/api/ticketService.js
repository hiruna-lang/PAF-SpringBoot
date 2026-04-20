import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api/module3";

const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem("smart-campus-m3-auth") || "null");

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  if (auth?.user?.id) {
    config.headers["X-User-Id"] = auth.user.id;
  }
  if (auth?.user?.name) {
    config.headers["X-User-Name"] = auth.user.name;
  }
  if (auth?.role) {
    config.headers["X-User-Role"] = auth.role;
  }

  return config;
});

function toApiError(error) {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to complete the request.";
  const apiError = new Error(message);
  apiError.status = error?.response?.status;
  apiError.fieldErrors = error?.response?.data?.fieldErrors || {};
  return apiError;
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
  try {
    const response = await apiClient.get("/tickets", { params: filters });
    return response.data.map(normalizeTicket);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function getTechnicians() {
  try {
    const response = await apiClient.get("/technicians");
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createTechnician(payload) {
  try {
    const response = await apiClient.post("/technicians", payload);
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function createTicket(payload) {
  try {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "attachments") {
        value.forEach((file) => formData.append("attachments", file.file));
      } else {
        formData.append(key, value);
      }
    });
    const response = await apiClient.post("/tickets", formData);
    return normalizeTicket(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function assignTechnician(ticketId, technicianId) {
  try {
    const response = await apiClient.patch(`/tickets/${ticketId}/assign`, { technicianId });
    return normalizeTicket(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateTicketStatus(ticketId, nextStatus, options = {}) {
  try {
    const response = await apiClient.patch(`/tickets/${ticketId}/status`, { status: nextStatus, ...options });
    return normalizeTicket(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function rejectTicket(ticketId, reason) {
  try {
    const response = await apiClient.patch(`/tickets/${ticketId}/reject`, { reason });
    return normalizeTicket(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function addComment(ticketId, message) {
  try {
    const response = await apiClient.post(`/tickets/${ticketId}/comments`, { message });
    return normalizeTicket(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function updateComment(ticketId, commentId, message) {
  try {
    const response = await apiClient.patch(`/tickets/${ticketId}/comments/${commentId}`, { message });
    return normalizeTicket(response.data);
  } catch (error) {
    throw toApiError(error);
  }
}

export async function deleteComment(ticketId, commentId) {
  try {
    await apiClient.delete(`/tickets/${ticketId}/comments/${commentId}`);
    return;
  } catch (error) {
    throw toApiError(error);
  }
}
