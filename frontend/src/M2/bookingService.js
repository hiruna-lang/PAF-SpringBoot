import { authFetch } from "../M4/authService";

const BASE = "http://localhost:8081/api/m2";

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!res.ok) {
    if (isJson) {
      const body = await res.json();
      throw new Error(body.message || `Request failed (${res.status})`);
    }
    throw new Error(`Request failed (${res.status})`);
  }
  if (res.status === 204 || !isJson) return null;
  return res.json();
}

// ── Resources ────────────────────────────────────────────────────────────────

export async function fetchResources(params = {}) {
  const qs = new URLSearchParams();
  if (params.keyword)     qs.set("keyword", params.keyword);
  if (params.type)        qs.set("type", params.type);
  if (params.status)      qs.set("status", params.status);
  if (params.minCapacity) qs.set("minCapacity", params.minCapacity);
  const res = await authFetch(`${BASE}/resources?${qs}`);
  return handleResponse(res);
}

export async function fetchResourceById(id) {
  const res = await authFetch(`${BASE}/resources/${id}`);
  return handleResponse(res);
}

export async function createResource(data) {
  const res = await authFetch(`${BASE}/resources`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateResource(id, data) {
  const res = await authFetch(`${BASE}/resources/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function setResourceStatus(id, status) {
  const res = await authFetch(`${BASE}/resources/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function deleteResource(id) {
  const res = await authFetch(`${BASE}/resources/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(data) {
  const res = await authFetch(`${BASE}/bookings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchMyBookings(status) {
  const qs = status ? `?status=${status}` : "";
  const res = await authFetch(`${BASE}/bookings/my${qs}`);
  return handleResponse(res);
}

export async function fetchAllBookings(status) {
  const qs = status ? `?status=${status}` : "";
  const res = await authFetch(`${BASE}/bookings${qs}`);
  return handleResponse(res);
}

export async function fetchAnalytics() {
  const res = await authFetch(`${BASE}/bookings/analytics`);
  return handleResponse(res);
}

export async function approveBooking(id, reason) {
  const res = await authFetch(`${BASE}/bookings/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function rejectBooking(id, reason) {
  const res = await authFetch(`${BASE}/bookings/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function cancelBooking(id, reason) {
  const res = await authFetch(`${BASE}/bookings/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}
