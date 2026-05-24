// frontend/src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getToken = () => localStorage.getItem("accessToken");

const apiCall = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Lỗi ${response.status}`);
  }

  return response.json();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) =>
    apiCall("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (username, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () => apiCall("/auth/logout", { method: "POST" }),

  getMe: () => apiCall("/auth/me"),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const userService = {
  getAll: () => apiCall("/users"),
  getById: (id) => apiCall(`/users/${id}`),
  update: (id, data) =>
    apiCall(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    apiCall(`/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ u_status: status }),
    }),
  delete: (id) => apiCall(`/users/${id}`, { method: "DELETE" }),
};

// ─── Lessons ─────────────────────────────────────────────────────────────────
export const lessonService = {
  getAll: () => apiCall("/lessons"),
  getById: (id) => apiCall(`/lessons/${id}`),
  create: (data) =>
    apiCall("/lessons", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    apiCall(`/lessons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/lessons/${id}`, { method: "DELETE" }),
};
