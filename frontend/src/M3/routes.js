const ROLE_SEGMENTS = {
  USER: "user",
  ADMIN: "admin",
  TECHNICIAN: "technician",
};

export function getRoleSegment(role) {
  return ROLE_SEGMENTS[role] || "";
}

export function getRoleFromSegment(segment) {
  const normalized = `${segment || ""}`.trim().toLowerCase();
  return (
    Object.entries(ROLE_SEGMENTS).find(([, value]) => value === normalized)?.[0] || null
  );
}

export function getRoleBasePath(role) {
  const segment = getRoleSegment(role);
  return segment ? `/m3/${segment}` : "/m3/access";
}

export function buildRolePath(role, suffix = "") {
  const basePath = getRoleBasePath(role);
  const normalizedSuffix = `${suffix || ""}`.replace(/^\/+/, "");
  return normalizedSuffix ? `${basePath}/${normalizedSuffix}` : basePath;
}
