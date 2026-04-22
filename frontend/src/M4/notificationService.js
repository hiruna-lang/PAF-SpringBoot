import { authFetch } from "./authService";

const BASE = "http://localhost:8081/api/notifications";

/** Fetch all notifications for the current user */
export async function fetchNotifications() {
  const res = await authFetch(BASE);
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

/** Get unread count only */
export async function fetchUnreadCount() {
  const res = await authFetch(`${BASE}/unread-count`);
  if (!res.ok) throw new Error("Failed to load unread count");
  const data = await res.json();
  return data.count;
}

/** Mark a single notification as read */
export async function markRead(id) {
  const res = await authFetch(`${BASE}/${id}/read`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
}

/** Mark all notifications as read */
export async function markAllRead() {
  const res = await authFetch(`${BASE}/read-all`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
}
