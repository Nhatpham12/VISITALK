if (!Auth.isLoggedIn()) window.location.href = "../Pages/Login.html";
if (!Auth.isAdmin()) window.location.href = "../Pages/Home.html";

let allUsers = [];

// ─── Load danh sách user ──────────────────────────────────────
async function loadUsers() {
  const tbody = document.querySelector(".user-table tbody");
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center">Đang tải...</td></tr>`;

  const result = await UsersAPI.getAll();
  if (!result?.ok) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:red">Lỗi tải dữ liệu</td></tr>`;
    return;
  }

  allUsers = result.data;
  renderUsers(allUsers);
}

function renderUsers(users) {
  const tbody = document.querySelector(".user-table tbody");

  if (users.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Chưa có dữ liệu người dùng</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map(
      (u) => `
    <tr data-id="${u.id}">
      <td>${u.full_name}</td>
      <td>—</td>
      <td>—</td>
      <td>${u.email || "—"}</td>
      <td>${u.username}</td>
      <td>••••••••</td>
      <td>${u.created_at ? new Date(u.created_at).toLocaleDateString("vi-VN") : "—"}</td>
      <td>${u.last_login ? new Date(u.last_login).toLocaleDateString("vi-VN") : "Chưa đăng nhập"}</td>
      <td>
        <button onclick="toggleStatus('${u.id}', '${u.u_status}')"
          style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer;
                 background:${u.u_status === "active" ? "#e74c3c" : "#2ecc71"}; color:white;">
          ${u.u_status === "active" ? "Khóa" : "Mở khóa"}
        </button>
        <button onclick="deleteUser('${u.id}', '${u.full_name}')"
          style="padding:4px 8px; border-radius:4px; border:none; cursor:pointer;
                 background:#888; color:white; margin-left:4px;">
          Xóa
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === "active" ? "inactive" : "active";
  const action = newStatus === "inactive" ? "khóa" : "mở khóa";

  if (!confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;

  const result = await UsersAPI.updateStatus(id, newStatus);
  if (result?.ok) {
    loadUsers(); // reload lại bảng
  } else {
    alert(result?.data?.message || "Thao tác thất bại");
  }
}

async function deleteUser(id, name) {
  if (
    !confirm(
      `Bạn có chắc muốn XÓA tài khoản "${name}"?\nHành động này không thể hoàn tác!`,
    )
  )
    return;

  const result = await UsersAPI.delete(id);
  if (result?.ok) {
    loadUsers();
  } else {
    alert(result?.data?.message || "Xóa thất bại");
  }
}

const actionBtns = document.querySelectorAll(".action-btn");
// Nút 1: Refresh danh sách
actionBtns[0]?.addEventListener("click", () => loadUsers());
// Nút 2: Thêm bài học (mở form)
actionBtns[1]?.addEventListener("click", () => openAddLessonForm());

function openAddLessonForm() {
  const title = prompt("Tiêu đề bài học:");
  if (!title) return;
  const meaning = prompt("Ý nghĩa:");
  const content = prompt("Nội dung:");
  const img_url = prompt("URL ảnh (để trống nếu không có):");

  LessonsAPI.insert({ title, meaning, content, img_url: img_url || null }).then(
    (result) => {
      if (result?.ok) {
        alert("Thêm bài học thành công!");
      } else {
        alert(result?.data?.message || "Thêm thất bại");
      }
    },
  );
}

const adminLabel = document.querySelector(".admin-label");
if (adminLabel) {
  const user = Auth.getUser();
  adminLabel.textContent = `QUẢN TRỊ VIÊN: ${user?.full_name || user?.username || ""}`;
}

// Avatar admin
const adminAvatar = document.querySelector(".avatar-icon");
if (adminAvatar && Auth.getUser()?.avatar_url) {
  adminAvatar.src = Auth.getUser().avatar_url;
}

loadUsers();
