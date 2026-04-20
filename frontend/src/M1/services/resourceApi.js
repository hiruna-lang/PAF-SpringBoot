const API_BASE_URL = "http://localhost:3000/api/resources";

const buildJsonOptions = (method, body) => ({
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const getAllResources = async () => {
  const response = await fetch(API_BASE_URL);
  return handleResponse(response);
};

export const getResourceById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return handleResponse(response);
};

export const createResource = async (resource) => {
  const response = await fetch(API_BASE_URL, buildJsonOptions("POST", resource));
  return handleResponse(response);
};

export const updateResource = async (id, resource) => {
  const response = await fetch(
    `${API_BASE_URL}/${id}`,
    buildJsonOptions("PUT", resource)
  );
  return handleResponse(response);
};

export const deleteResource = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
  return handleResponse(response);
};

export const getResourcesByType = async (type) => {
  const response = await fetch(`${API_BASE_URL}/type/${encodeURIComponent(type)}`);
  return handleResponse(response);
};

export const getResourcesByLocation = async (location) => {
  const response = await fetch(
    `${API_BASE_URL}/location/${encodeURIComponent(location)}`
  );
  return handleResponse(response);
};

export const getResourcesByCapacity = async (capacity) => {
  const response = await fetch(
    `${API_BASE_URL}/capacity/${encodeURIComponent(capacity)}`
  );
  return handleResponse(response);
};

export const getResourcesByStatus = async (status) => {
  const response = await fetch(
    `${API_BASE_URL}/status/${encodeURIComponent(status)}`
  );
  return handleResponse(response);
};
