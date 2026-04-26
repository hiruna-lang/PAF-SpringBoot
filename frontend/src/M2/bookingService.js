import { authFetch } from "../M4/authService";

const API_BASE = "http://localhost:8081/api";
const RESOURCE_BASE = `${API_BASE}/resources`;
const BOOKING_BASE = `${API_BASE}/m2`;

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
  const res = await authFetch(RESOURCE_BASE);
  const resources = await handleResponse(res);

  return resources.filter((resource) => {
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      const matchesKeyword = [resource.name, resource.location, resource.description, resource.availabilityNote]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
      if (!matchesKeyword) return false;
    }

    if (params.type && resource.type !== params.type) return false;
    if (params.status && resource.status !== params.status) return false;
    if (params.minCapacity != null && Number(resource.capacity || 0) < Number(params.minCapacity)) return false;

    return true;
  });
}

export async function fetchResourceById(id) {
  const res = await authFetch(`${RESOURCE_BASE}/${id}`);
  return handleResponse(res);
}

export async function createResource(data) {
  const res = await authFetch(RESOURCE_BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateResource(id, data) {
  const res = await authFetch(`${RESOURCE_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function setResourceStatus(id, status) {
  const currentResource = await fetchResourceById(id);
  return updateResource(id, { ...currentResource, status });
}

export async function deleteResource(id) {
  const res = await authFetch(`${RESOURCE_BASE}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

// ── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(data) {
  const res = await authFetch(`${BOOKING_BASE}/bookings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchMyBookings(status) {
  const qs = status ? `?status=${status}` : "";
  const res = await authFetch(`${BOOKING_BASE}/bookings/my${qs}`);
  return handleResponse(res);
}

export async function fetchAllBookings(status) {
  const qs = status ? `?status=${status}` : "";
  const res = await authFetch(`${BOOKING_BASE}/bookings${qs}`);
  return handleResponse(res);
}

export async function fetchAnalytics() {
  const res = await authFetch(`${BOOKING_BASE}/bookings/analytics`);
  return handleResponse(res);
}

export async function approveBooking(id, reason) {
  const res = await authFetch(`${BOOKING_BASE}/bookings/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function rejectBooking(id, reason) {
  const res = await authFetch(`${BOOKING_BASE}/bookings/${id}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}

export async function cancelBooking(id, reason) {
  const res = await authFetch(`${BOOKING_BASE}/bookings/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}
