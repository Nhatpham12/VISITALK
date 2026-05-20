// frontend/src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getToken = () => localStorage.getItem("access_token");

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
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ✅ SỬA LẠI: thêm "/api" phía trước
  login: (username, password) =>
    apiCall("/auth/login", {
      // 👈 ĐÃ SỬA
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () => apiCall("/api/auth/logout", { method: "POST" }), // 👈 SỬA

  getMe: () => apiCall("/api/auth/me"), // 👈 SỬA
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const userService = {
  getAll: () => apiCall("/api/users"), // 👈 SỬA
  getById: (id) => apiCall(`/api/users/${id}`), // 👈 SỬA
  update: (id, data) =>
    apiCall(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateStatus: (id, status) =>
    apiCall(`/api/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ u_status: status }),
    }),
  delete: (id) => apiCall(`/api/users/${id}`, { method: "DELETE" }),
};

// ─── Lessons ─────────────────────────────────────────────────────────────────

export const lessonService = {
  getAll: () => apiCall("/api/lessons"), // 👈 SỬA
  getById: (id) => apiCall(`/api/lessons/${id}`), // 👈 SỬA
  create: (data) =>
    apiCall("/api/lessons", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    apiCall(`/api/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => apiCall(`/api/lessons/${id}`, { method: "DELETE" }),
};
