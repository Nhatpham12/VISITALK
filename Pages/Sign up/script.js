document.getElementById("sign-up").addEventListener("click", function () {
  const fullname = document.getElementById("fullname").value.trim();
  const dob = document.getElementById("DoB").value.trim();
  const email = document.getElementById("Email").value.trim();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const pass2 = document.getElementById("pass2").value.trim();

  // --- Kiểm tra bỏ trống ---
  if (!fullname || !dob || !email || !username || !password || !pass2) {
    showModal("error", "Vui lòng điền đầy đủ thông tin!");
    return;
  }

  // --- Kiểm tra định dạng email ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showModal("error", "Email không hợp lệ!");
    return;
  }

  // --- Kiểm tra mật khẩu khớp ---
  if (password !== pass2) {
    showModal("error", "Mật khẩu nhập lại không khớp!");
    return;
  }

  // --- Hiển thị thông tin đăng ký ---
  const info = `
    <strong>Họ và tên:</strong> ${fullname}<br/>
    <strong>Ngày sinh:</strong> ${dob}<br/>
    <strong>Email:</strong> ${email}<br/>
    <strong>Tên đăng nhập:</strong> ${username}
  `;
  showModal("success", info);
});

// --- Hàm tạo Modal ---
function showModal(type, htmlContent) {
  // Xoá modal cũ nếu có
  const existing = document.getElementById("info-modal");
  if (existing) existing.remove();

  const isSuccess = type === "success";

  const overlay = document.createElement("div");
  overlay.id = "info-modal";
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
    background: #1a2a4a;
    border: 2px solid ${isSuccess ? "#4ade80" : "#f87171"};
    border-radius: 20px;
    padding: 36px 40px;
    width: 360px;
    color: #ffffff;
    font-family: 'Segoe UI', sans-serif;
    text-align: center;
    animation: slideUp 0.25s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    font-size: 42px;
    margin-bottom: 14px;
  `;
  icon.textContent = isSuccess ? "✅" : "⚠️";

  const title = document.createElement("h3");
  title.style.cssText = `
    font-size: 18px;
    font-weight: 800;
    margin-bottom: 14px;
    color: ${isSuccess ? "#4ade80" : "#f87171"};
  `;
  title.textContent = isSuccess ? "Đăng ký thành công!" : "Lỗi";

  const body = document.createElement("p");
  body.style.cssText = `
    font-size: 14px;
    line-height: 1.8;
    color: #cbd5e1;
    margin-bottom: 24px;
  `;
  body.innerHTML = htmlContent;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Đóng";
  closeBtn.style.cssText = `
    padding: 10px 40px;
    border: 2px solid #ffffff;
    border-radius: 25px;
    background: transparent;
    color: #ffffff;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  `;
  closeBtn.onmouseover = () => {
    closeBtn.style.background = "#ffffff";
    closeBtn.style.color = "#1a2a4a";
  };
  closeBtn.onmouseleave = () => {
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "#ffffff";
  };
  closeBtn.onclick = () => overlay.remove();

  // Đóng khi click ra ngoài
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

  box.appendChild(icon);
  box.appendChild(title);
  box.appendChild(body);
  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Inject keyframe animations một lần
  if (!document.getElementById("modal-styles")) {
    const style = document.createElement("style");
    style.id = "modal-styles";
    style.textContent = `
      @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    `;
    document.head.appendChild(style);
  }
}
