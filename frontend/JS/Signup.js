document.getElementById("sign-up").addEventListener("click", async () => {
  const full_name = document.getElementById("fullname").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("Email").value.trim() || null;
  const password = document.getElementById("password").value.trim();
  const pass2 = document.getElementById("pass2").value.trim();

  if (!full_name || !username || !password || !pass2) {
    alert("Vui lòng điền đầy đủ thông tin bắt buộc");
    return;
  }

  if (password !== pass2) {
    alert("Mật khẩu nhập lại không khớp");
    return;
  }

  if (password.length < 6) {
    alert("Mật khẩu phải có ít nhất 6 ký tự");
    return;
  }

  const btn = document.getElementById("sign-up");
  btn.disabled = true;
  btn.textContent = "Đang đăng ký...";

  const result = await AuthAPI.register(username, full_name, password, email);

  btn.disabled = false;
  btn.textContent = "Đăng ký";

  if (!result) return;

  if (result.ok) {
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    window.location.href = "../Pages/Login.html";
  } else {
    alert(result.data?.message || "Đăng ký thất bại");
  }
});
