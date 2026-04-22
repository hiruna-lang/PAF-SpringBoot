const apiBaseUrl =
  process.env.REACT_APP_M3_API_BASE_URL ||
  "http://localhost:8081/api/module3";

function getAuthHeaders() {
  const auth = JSON.parse(localStorage.getItem("smart-campus-m3-auth") || "null");
  const m4Token = localStorage.getItem("token");
  const m4User  = JSON.parse(localStorage.getItem("user") || "null");

  const headers = { "Content-Type": "application/json" };

  if (m4Token) {
    // Real M4 JWT always takes priority
    headers.Authorization = `Bearer ${m4Token}`;
    if (m4User?.name)  headers["X-User-Name"] = m4User.name;
    if (m4User?.email) headers["X-User-Id"]   = m4User.email;
    if (m4User?.email) headers["X-User-Email"] = m4User.email;
    const m4Role = m4User?.role || "USER";
    const m3Role = m4Role === "ADMIN" || m4Role === "MANAGER" ? "ADMIN"
                 : m4Role === "TECHNICIAN" ? "TECHNICIAN"
                 : "USER";
    headers["X-User-Role"] = m3Role;
  } else if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
    if (auth?.user?.id)    headers["X-User-Id"]   = auth.user.id;
    if (auth?.user?.name)  headers["X-User-Name"] = auth.user.name;
    if (auth?.user?.email) headers["X-User-Email"] = auth.user.email;
    if (auth?.role)        headers["X-User-Role"]  = auth.role;
  }

  return headers;
}

async function request(path, { method = "GET" } = {}) {
  const url = `${apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const response = await fetch(url, { method, headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Notification request failed: ${response.status}`);
  }
  return response.json();
}

export async function getNotifications() {
  return request("/notifications");
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return request("/notifications/read-all", { method: "PATCH" });
}
