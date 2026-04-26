const BASE_URL = "http://127.0.0.1:5000/api";

// Quản lý token & user
const Auth = {
  saveToken: (t) => sessionStorage.setItem("token", t),
  getToken: () => sessionStorage.getItem("token"),
  saveUser: (u) => sessionStorage.setItem("user", JSON.stringify(u)),
  getUser: () => {
    const u = sessionStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
  clear: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
  isLoggedIn: () => !!sessionStorage.getItem("token"),
  isAdmin: () => {
    const u = Auth.getUser();
    return u?.u_role === "admin";
  },
};

// Hàm gọi API trung tâm
async function callAPI(
  endpoint,
  method = "GET",
  body = null,
  requireAuth = true,
) {
  const headers = { "Content-Type": "application/json" };

  if (requireAuth) {
    const token = Auth.getToken();
    if (!token) {
      window.location.href = "../Pages/Login.html";
      return null;
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json();

    if (res.status === 401) {
      Auth.clear();
      window.location.href = "../Pages/Login.html";
      return null;
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("Lỗi kết nối:", err);
    alert("Không thể kết nối server. Hãy kiểm tra backend đang chạy chưa.");
    return null;
  }
}

//  Auth API
const AuthAPI = {
  async register(username, full_name, password, email) {
    return callAPI(
      "/auth/register",
      "POST",
      { username, full_name, password, email },
      false,
    );
  },
  async login(username, password) {
    const result = await callAPI(
      "/auth/login",
      "POST",
      { username, password },
      false,
    );
    if (result?.ok) {
      Auth.saveToken(result.data.token);
      Auth.saveUser(result.data.user);
    }
    return result;
  },
  async logout() {
    await callAPI("/auth/logout", "POST");
    Auth.clear();
    window.location.href = "../Pages/Login.html";
  },
};

//Users API
const UsersAPI = {
  async getAll() {
    return callAPI("/users");
  },
  async getById(id) {
    return callAPI(`/users/${id}`);
  },
  async update(id, data) {
    return callAPI(`/users/${id}`, "PUT", data);
  },
  async updateStatus(id, u_status) {
    return callAPI(`/users/${id}/status`, "PATCH", { u_status });
  },
  async delete(id) {
    return callAPI(`/users/${id}`, "DELETE");
  },
};

// Lessons API
const LessonsAPI = {
  async getAll() {
    return callAPI("/lessons");
  },
  async getById(id) {
    return callAPI(`/lessons/${id}`);
  },
  async insert(data) {
    return callAPI("/lessons", "POST", data);
  },
  async update(id, data) {
    return callAPI(`/lessons/${id}`, "PUT", data);
  },
  async delete(id) {
    return callAPI(`/lessons/${id}`, "DELETE");
  },
};
