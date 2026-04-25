document.getElementById("login").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    alert("Vui lòng nhập tên đăng nhập và mật khẩu");
    return;
  }

  const btn = document.getElementById("login");
  btn.disabled = true;
  btn.textContent = "Đang đăng nhập...";

  const result = await AuthAPI.login(username, password);

  btn.disabled = false;
  btn.textContent = "Đăng nhập";

  if (!result) return;

  if (result.ok) {
    const user = Auth.getUser();
    // Admin → trang Admin, user thường → trang Home
    if (user?.u_role === "admin") {
      window.location.href = "../Pages/Admin.html";
    } else {
      window.location.href = "../Pages/Home.html";
    }
  } else {
    alert(result.data?.message || "Đăng nhập thất bại");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("login").click();
});
