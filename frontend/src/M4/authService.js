const BASE_URL = "http://localhost:8081/api/auth";

export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Registration failed");
  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");
  return result;
}

export function loginWithGoogle() {
  window.location.href = "http://localhost:8081/oauth2/authorization/google";
}

/** Persist auth data — now includes role */
export function saveAuth(authResponse) {
  localStorage.setItem("token", authResponse.token);
  localStorage.setItem("loginTime", Date.now().toString());
  localStorage.setItem(
    "user",
    JSON.stringify({
      email:    authResponse.email,
      name:     authResponse.name,
      provider: authResponse.provider,
      role:     authResponse.role || "USER",
    })
  );
}

export function getToken()   { return localStorage.getItem("token"); }

export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

export function getRole() {
  const user = getUser();
  return user?.role || "USER";
}

export function isLoggedIn() { return !!getToken(); }

export function hasRole(role) { return getRole() === role; }

export function isAdmin()   { return hasRole("ADMIN"); }
export function isManager() { return hasRole("MANAGER") || hasRole("ADMIN"); }

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loginTime");
}

/** Authenticated fetch — attaches Bearer token automatically */
export async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
