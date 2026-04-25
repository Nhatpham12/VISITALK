// Bảo vệ trang
if (!Auth.isLoggedIn()) window.location.href = "../Pages/Login.html";

// Load thông tin user từ sessionStorage trước (hiển thị nhanh)
function renderUser(user) {
  if (!user) return;
  const el = (id) => document.getElementById(id);
  if (el("fullname")) el("fullname").value = user.full_name || "";
  if (el("username")) el("username").value = user.username || "";
  if (el("Email")) el("Email").value = user.email || "";
  // DoB và sex chưa có trong DB, để trống
  if (el("DoB")) el("DoB").value = "";
  if (el("sex")) el("sex").value = "";

  // Avatar
  const avatar = document.querySelector(".avatar");
  if (avatar && user.avatar_url) {
    avatar.style.backgroundImage = `url('${user.avatar_url}')`;
    avatar.style.backgroundSize = "cover";
  }
}

// Load từ server để đảm bảo dữ liệu mới nhất
async function loadProfile() {
  const cached = Auth.getUser();
  renderUser(cached); // hiển thị nhanh từ cache

  const result = await UsersAPI.getById(cached.id);
  if (result?.ok) {
    Auth.saveUser(result.data); // cập nhật cache
    renderUser(result.data);
  }
}

// Nút Thay đổi thông tin
document.getElementById("change")?.addEventListener("click", async () => {
  const user = Auth.getUser();
  const full_name = document.getElementById("fullname").value.trim();
  const email = document.getElementById("Email").value.trim() || null;
  const avatar_url = user.avatar_url || null;

  if (!full_name) {
    alert("Họ và tên không được để trống");
    return;
  }

  const btn = document.getElementById("change");
  btn.disabled = true;
  btn.textContent = "Đang lưu...";

  const result = await UsersAPI.update(user.id, {
    full_name,
    email,
    avatar_url,
  });

  btn.disabled = false;
  btn.textContent = "Thay đổi thông tin cá nhân";

  if (result?.ok) {
    // Cập nhật lại cache
    Auth.saveUser({ ...user, full_name, email });
    alert("Cập nhật thành công!");
  } else {
    alert(result?.data?.message || "Cập nhật thất bại");
  }
});

// Nút đổi avatar (upload file)
document.getElementById("change-avt")?.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tạm thời dùng URL local để preview
    const localURL = URL.createObjectURL(file);
    const avatar = document.querySelector(".avatar");
    if (avatar) {
      avatar.style.backgroundImage = `url('${localURL}')`;
      avatar.style.backgroundSize = "cover";
    }
    // TODO: Upload file lên server storage (cần thêm endpoint upload)
    alert(
      "Ảnh đã được cập nhật tạm thời. Tính năng lưu ảnh lên server sẽ được thêm sau.",
    );
  };
  input.click();
});

// Nút xóa avatar
document.getElementById("del-avt")?.addEventListener("click", async () => {
  if (!confirm("Bạn có chắc muốn xóa ảnh đại diện?")) return;

  const user = Auth.getUser();
  const result = await UsersAPI.update(user.id, {
    full_name: user.full_name,
    email: user.email,
    avatar_url: null,
  });

  if (result?.ok) {
    Auth.saveUser({ ...user, avatar_url: null });
    const avatar = document.querySelector(".avatar");
    if (avatar) avatar.style.backgroundImage = "";
    alert("Đã xóa ảnh đại diện");
  } else {
    alert("Xóa ảnh thất bại");
  }
});

loadProfile();
