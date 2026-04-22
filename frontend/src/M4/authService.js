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

/** Persist auth data — now includes role and photoUrl */
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
      photoUrl: authResponse.photoUrl || null,
    })
  );
}

/** Update just the photo in localStorage (for local user uploads) */
export function savePhoto(dataUrl) {
  const user = getUser();
  if (!user) return;
  user.photoUrl = dataUrl;
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Save photo to backend DB — persists across logout/login
 * Returns updated AuthResponse so we can refresh localStorage
 */
export async function savePhotoToServer(dataUrl) {
  const res = await authFetch("http://localhost:8081/api/profile/photo", {
    method: "PUT",
    body: JSON.stringify({ photoUrl: dataUrl }),
  });
  if (!res.ok) throw new Error("Failed to save photo");
  const updated = await res.json();
  // Refresh localStorage with server response (keeps token, updates photoUrl)
  saveAuth(updated);
  return updated;
}

/**
 * Load the latest profile from server (gets saved photo after re-login)
 */
export async function loadProfileFromServer() {
  try {
    const res = await authFetch("http://localhost:8081/api/profile/me");
    if (!res.ok) return;
    const profile = await res.json();
    if (profile.photoUrl) {
      savePhoto(profile.photoUrl);
    }
  } catch {
    // silently fail — offline or token expired
  }
}

export function getToken()   { return localStorage.getItem("token"); }

export function getUser() {
  const u = localStorage.getItem("user");
  if (!u || u === "undefined") return null;
  try {
    return JSON.parse(u);
  } catch {
    return null;
  }
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
